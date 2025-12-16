import axios from 'axios'
import { debounce, throttle } from '@/utils/debounce'

const axiosInstance = axios.create({
  baseURL: '/c',
  timeout: 10000,
})

// 简单工具函数
const tools = {
  getUUID: () => localStorage.getItem('user_uuid'),
  getToken: () => localStorage.getItem('auth_token'),
  setToken: (token) => localStorage.setItem('auth_token', token),
  clearToken: () => localStorage.removeItem('auth_token'),
}

// 获取新令牌
async function getNewToken() {
  const uuid = tools.getUUID()
  if (!uuid) return null
  
  try {
    const response = await axios.post('/c/wallet-bot/token', {
      user_uuid: uuid
    })
    const token = response.data.data.access_token
    tools.setToken(token)
    return token
  } catch (error) {
    console.error('获取令牌失败:', error)
    return null
  }
}

// 请求拦截器
axiosInstance.interceptors.request.use(async (config) => {
  let token = tools.getToken()
  // 首次请求，没有令牌就获取一个
  if (!token || typeof token !== 'string' || token.includes('[object Object]') || token.includes('undefined')) {
    token = await getNewToken()
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // 检查是否是认证错误
    if ((error.response?.status === 401 || error.response?.status === 412) && 
        !originalRequest._retry) {
      
      originalRequest._retry = true
      
      // 尝试重新获取令牌
      const newToken = await getNewToken()
      if (newToken) {
        // 重试请求
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      }
    }
    
    return Promise.reject(error)
  }
)

// 创建一个API客户端类，节流策略
// api/client.js
// api/client.js
class ApiClient {
  constructor() {
    this.instance = axiosInstance
    this.lastRequestTime = new Map() // 记录每个请求key的最后执行时间
    this.pendingRequests = new Map() // 记录进行中的请求
    this.cancelTokens = new Map()    // 取消令牌
  }
  
  /**
   * 节流GET：固定时间间隔内只执行一次，中间请求被忽略
   * @param {number} throttleMs - 节流时间（毫秒），默认500ms
   */
  throttledGet(url, config = {}, throttleMs = 500) {
    const key = this._getRequestKey(url, config)
    const now = Date.now()
    
    // 获取上次请求时间
    const lastTime = this.lastRequestTime.get(key) || 0
    const timeSinceLastRequest = now - lastTime
    
    // 如果距离上次请求时间小于节流间隔，忽略本次请求
    if (timeSinceLastRequest < throttleMs) {
      console.log(`🚫 请求被节流忽略: ${key} (${timeSinceLastRequest}ms < ${throttleMs}ms)`)
      
      // 选项1：直接返回一个拒绝的Promise（告诉调用者请求被忽略）
      return Promise.reject(new ThrottledError('请求过于频繁，已被节流忽略'))
      
      // 选项2：返回上一次请求的结果（如果有缓存）
      // return this._getCachedResponse(key)
    }
    
    // 更新最后请求时间
    this.lastRequestTime.set(key, now)
    
    // 取消之前可能还在进行的同一个请求
    this._cancelPendingRequest(key, '被新的节流请求取消')
    
    // 执行请求
    return this._executeThrottledRequest(url, config, key)
  }
  
  /**
   * 执行节流请求
   */
  async _executeThrottledRequest(url, config, key) {
    // 创建取消令牌
    const cancelToken = axios.CancelToken.source()
    this.cancelTokens.set(key, cancelToken)
    this.pendingRequests.set(key, true)
    
    try {
      const requestConfig = {
        ...config,
        cancelToken: cancelToken.token,
        timeout: config.timeout || 10000
      }
      
      const response = await this.instance.get(url, requestConfig)
      
      // 清理
      this._cleanupRequest(key)
      
      return response
      
    } catch (error) {
      this._cleanupRequest(key)
      
      if (axios.isCancel(error)) {
        throw new RequestCancelledError('请求被取消')
      }
      throw error
    }
  }
  
  /**
   * 获取请求的唯一key（基于URL和参数）
   */
  _getRequestKey(url, config) {
    // 只根据核心参数生成key，忽略不重要的配置
    const params = config.params || {}
    
    // 对参数排序，确保相同参数不同顺序也能识别为同一个请求
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key]
        return acc
      }, {})
    
    return `${url}:${JSON.stringify(sortedParams)}`
  }
  
  /**
   * 取消进行中的请求
   */
  _cancelPendingRequest(key, reason = '请求被取消') {
    if (this.cancelTokens.has(key)) {
      this.cancelTokens.get(key).cancel(reason)
      this.cancelTokens.delete(key)
    }
    this.pendingRequests.delete(key)
  }
  
  /**
   * 清理请求相关资源
   */
  _cleanupRequest(key) {
    this.cancelTokens.delete(key)
    this.pendingRequests.delete(key)
  }
  
  /**
   * 重置节流状态（用于特定key）
   */
  resetThrottle(key) {
    this.lastRequestTime.delete(key)
    this._cancelPendingRequest(key)
  }
  
  /**
   * 重置所有节流状态
   */
  resetAllThrottles() {
    this.lastRequestTime.clear()
    for (const key of this.cancelTokens.keys()) {
      this._cancelPendingRequest(key, '重置所有节流')
    }
  }
}

// 自定义错误类型
class ThrottledError extends Error {
  constructor(message = '请求被节流忽略') {
    super(message)
    this.name = 'ThrottledError'
    this.isThrottled = true
  }
}

class RequestCancelledError extends Error {
  constructor(message = '请求被取消') {
    super(message)
    this.name = 'RequestCancelledError'
    this.isCancelled = true
  }
}

// 创建单例
const apiClient = new ApiClient()

export default apiClient

// 也导出基础工具函数，供特殊场景使用
export { debounce, throttle, axiosInstance as baseAxios }
