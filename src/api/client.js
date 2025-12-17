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
class ApiClient {
  constructor() {
    this.instance = axiosInstance
    this.lastRequestTime = new Map()
    this.pendingRequests = new Map()
    this.cancelTokens = new Map()
  }
  
  /**
   * 节流GET：固定时间间隔内只执行一次，中间请求被忽略
   */
  throttledGet(url, config = {}, throttleMs = 500) {
    const key = this._getRequestKey('GET', url, config)
    return this._executeThrottledRequest('GET', url, null, config, key, throttleMs)
  }
  
  /**
   * 节流POST：固定时间间隔内只执行一次，中间请求被忽略
   */
  throttledPost(url, data = {}, config = {}, throttleMs = 500) {
    const key = this._getRequestKey('POST', url, config, data)
    return this._executeThrottledRequest('POST', url, data, config, key, throttleMs)
  }
  
  /**
   * 节流PUT：固定时间间隔内只执行一次，中间请求被忽略
   */
  throttledPut(url, data = {}, config = {}, throttleMs = 500) {
    const key = this._getRequestKey('PUT', url, config, data)
    return this._executeThrottledRequest('PUT', url, data, config, key, throttleMs)
  }
  
  /**
   * 通用的节流请求执行方法
   */
  _executeThrottledRequest(method, url, data, config, key, throttleMs) {
    const now = Date.now()
    
    const lastTime = this.lastRequestTime.get(key) || 0
    const timeSinceLastRequest = now - lastTime
    
    if (timeSinceLastRequest < throttleMs) {
      console.log(`🚫 ${method}请求被节流忽略`)
      return Promise.reject(new ThrottledError('请求过于频繁，已被节流忽略'))
    }
    
    this.lastRequestTime.set(key, now)
    this._cancelPendingRequest(key, `新的${method}节流请求`)
    
    return this._executeRequest(method, url, data, config, key)
  }
  
  /**
   * 执行请求
   */
  async _executeRequest(method, url, data, config, key) {
    const cancelToken = axios.CancelToken.source()
    this.cancelTokens.set(key, cancelToken)
    this.pendingRequests.set(key, true)
    
    try {
      const requestConfig = {
        ...config,
        cancelToken: cancelToken.token,
        timeout: config.timeout || 10000
      }
      
      let response
      if (method === 'GET') {
        response = await this.instance.get(url, requestConfig)
      } else if (method === 'POST') {
        response = await this.instance.post(url, data, requestConfig)
      } else if (method === 'PUT') {
        response = await this.instance.put(url, data, requestConfig)
      } else {
        throw new Error(`不支持的请求方法: ${method}`)
      }
      
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
  _getRequestKey(method, url, config, data = null) {
    // 只根据核心参数生成key，忽略不重要的配置
    const params = config.params || {}
    
    // 对参数排序，确保相同参数不同顺序也能识别为同一个请求
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key]
        return acc
      }, {})
    
    // 基础key
    let key = `${method}:${url}:${JSON.stringify(sortedParams)}`
    
    // 对于POST/PUT请求，添加请求数据
    if (data && (method === 'POST' || method === 'PUT')) {
      try {
        // 简单处理：如果数据是对象就转字符串，否则直接使用
        const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data)
        // 简单哈希避免key太长
        let hash = 0
        for (let i = 0; i < dataStr.length; i++) {
          hash = ((hash << 5) - hash) + dataStr.charCodeAt(i)
          hash = hash & hash
        }
        key += `:${Math.abs(hash).toString(36)}`
      } catch (error) {
        console.warn('处理请求数据失败:', error)
        key += `:${String(data).slice(0, 50)}` // 限制长度
      }
    }
    
    return key
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
