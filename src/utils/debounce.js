// src/utils/debounce.js
/**
 * 高阶防抖函数
 * @param {Function} fn - 原始函数
 * @param {number} delay - 延迟时间(ms)
 * @param {boolean} immediate - 是否立即执行
 */
export function debounce(fn, delay = 300, immediate = false) {
  let timer = null
  let isImmediateCalled = false
  
  return function debounced(...args) {
    const context = this
    
    const later = () => {
      timer = null
      if (!immediate || !isImmediateCalled) {
        fn.apply(context, args)
      }
    }
    
    if (immediate && !timer && !isImmediateCalled) {
      fn.apply(context, args)
      isImmediateCalled = true
    } else {
      isImmediateCalled = false
    }
    
    clearTimeout(timer)
    timer = setTimeout(later, delay)
  }
}

/**
 * 高阶节流函数
 */
export function throttle(fn, limit = 300) {
  let inThrottle = false
  let lastResult
  
  return function throttled(...args) {
    const context = this
    
    if (!inThrottle) {
      inThrottle = true
      lastResult = fn.apply(context, args)
      
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
    
    return lastResult
  }
}

/**
 * 防抖装饰器（用于类方法）
 */
export function Debounce(delay = 300, immediate = false) {
  return function(target, key, descriptor) {
    const original = descriptor.value
    
    if (typeof original === 'function') {
      descriptor.value = debounce(original, delay, immediate)
    }
    
    return descriptor
  }
}

/**
 * 节流装饰器（用于类方法）
 */
export function Throttle(limit = 300) {
  return function(target, key, descriptor) {
    const original = descriptor.value
    
    if (typeof original === 'function') {
      descriptor.value = throttle(original, limit)
    }
    
    return descriptor
  }
}