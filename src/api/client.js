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

// 创建一个API客户端类，封装防抖功能
class ApiClient {
  constructor() {
    this.instance = axiosInstance
    this.requestCache = new Map() // 缓存防抖函数
  }
  
  /**
   * 普通GET请求
   */
  async get(url, config = {}) {
    return this.instance.get(url, config)
  }
  
  /**
   * 普通POST请求
   */
  async post(url, data = {}, config = {}) {
    return this.instance.post(url, data, config)
  }
  
  /**
   * 防抖GET请求
   * @param {string} url - 请求地址
   * @param {Object} config - 请求配置
   * @param {number} delay - 防抖延迟(ms)
   * @returns {Promise} - 防抖处理的Promise
   */
  debouncedGet(url, config = {}, delay = 300) {
    const cacheKey = `${url}:${JSON.stringify(config)}:${delay}`
    
    if (!this.requestCache.has(cacheKey)) {
      const debouncedFn = debounce(async () => {
        try {
          return await this.instance.get(url, config)
        } catch (error) {
          throw error
        }
      }, delay)
      
      this.requestCache.set(cacheKey, debouncedFn)
    }
    
    return this.requestCache.get(cacheKey)()
  }
  
  /**
   * 防抖POST请求
   */
  debouncedPost(url, data = {}, config = {}, delay = 300) {
    const cacheKey = `${url}:${JSON.stringify(data)}:${JSON.stringify(config)}:${delay}`
    
    if (!this.requestCache.has(cacheKey)) {
      const debouncedFn = debounce(async () => {
        try {
          return await this.instance.post(url, data, config)
        } catch (error) {
          throw error
        }
      }, delay)
      
      this.requestCache.set(cacheKey, debouncedFn)
    }
    
    return this.requestCache.get(cacheKey)()
  }
  
  /**
   * 带取消功能的防抖请求
   * @returns {Function} 取消函数
   */
  cancellableDebouncedGet(url, config = {}, delay = 300) {
    let cancelToken = null
    
    const debouncedFn = debounce(async () => {
      if (cancelToken) {
        cancelToken.cancel('Operation canceled due to new request')
      }
      
      cancelToken = axios.CancelToken.source()
      config.cancelToken = cancelToken.token
      
      try {
        return await this.instance.get(url, config)
      } catch (error) {
        if (!axios.isCancel(error)) {
          throw error
        }
      }
    }, delay)
    
    const execute = () => debouncedFn()
    const cancel = () => {
      if (cancelToken) {
        cancelToken.cancel('Request canceled by user')
      }
    }
    
    return { execute, cancel }
  }
  
  /**
   * 清除指定URL的缓存
   */
  clearCache(url) {
    for (const [key] of this.requestCache) {
      if (key.startsWith(url)) {
        this.requestCache.delete(key)
      }
    }
  }
  
  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this.requestCache.clear()
  }
}

// 创建单例
const apiClient = new ApiClient()

export default apiClient

// 也导出基础工具函数，供特殊场景使用
export { debounce, throttle, axiosInstance as baseAxios }
