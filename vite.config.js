import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8080, // 启动端口
    open: true,  // 启动后自动打开浏览器

    // 🔧 新增：代理配置
    proxy: {
      // 代理规则1：将以 /api 开头的请求转发到后端
      '/c': {
        target: 'http://localhost:8000', // 你的后端地址
        changeOrigin: true, // 允许跨域
      }
    },
  }
})
