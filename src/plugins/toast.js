// src/plugins/toast.js
import { show } from '../components/Toast.vue'

export default {
  install(app) {
    // 挂载到Vue实例
    app.config.globalProperties.$toast = show
    
    // 挂载到app实例
    app.provide('toast', show)
    
    // 挂载到window（可选）
    window.$toast = show
  }
}