import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局路由守卫 - 控制所有页面的 Telegram BackButton
router.afterEach((to, from) => {
  // 延迟执行，确保页面渲染完成
  setTimeout(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      console.log('路由变化，控制 Telegram:', {
        从: from.path,
        到: to.path,
        版本: tg.version
      })
      
      // 定义需要显示 BackButton 的页面
      const showBackPages = ['/recharge', '/withdraw', '/bill', '/settings', '/withdraw-password']
      
      // 定义首页（隐藏 BackButton）
      const homePages = ['/', '/home']
      // 从bot进来的链接不处理
      if(to.query.entry && to.query.entry === 'bot'){
        tg.expand?.()
        return
      }
      
      if (showBackPages.includes(to.path)) {
        // 显示 BackButton
        console.log('显示 BackButton')
        
        // 先清除旧的事件
        tg.BackButton.offClick?.()
        
        // 显示按钮
        tg.BackButton.show?.()
        
        // 设置点击事件 - 返回首页
        tg.BackButton.onClick?.(() => {
          console.log('BackButton 点击，返回首页')
          router.go(-1)
        })
        
      } else if (homePages.includes(to.path)) {
        tg.BackButton.hide?.()
        tg.BackButton.offClick?.()
      }
      
      // 强制展开（确保 Telegram UI 更新）
      tg.expand?.()
    }
  }, 100) // 100ms 延迟
})

app.use(router)
app.mount('#app')