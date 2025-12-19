<template>
  <div class="settings-page">
    <!-- 设置卡片 -->
    <section class="settings-card">
      <div class="card-header">
        <div class="card-header-left">
          <h2 class="card-title">设置</h2>
        </div>
      </div>
      
      <!-- 设置项列表 -->
      <div class="settings-list">
        <!-- 提现密码 -->
        <router-link :to="`/withdraw-password?action=${action}`" class="settings-item">
          <div class="item-left">
            <div class="item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="10" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/>
                <path d="M7 10V6a5 5 0 0 1 5-5v0a5 5 0 0 1 5 5v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <div class="item-content">
              <h3 class="item-title">提现密码</h3>
              <p class="item-desc">设置或修改提现密码</p>
            </div>
          </div>
          <div class="item-right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import apiClient from '../api/client'

// 默认 action 为 'set'
const action = ref('set')

// 页面加载时检查
onMounted(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const userUUid = localStorage.getItem('user_uuid') || urlParams.get('user_uuid')
    if(!userUUid){
        console.warn('⚠️ 未找到 user_uuid')
        errorMessage.value = '未找到用户标识'
        return
    }

    const response = await apiClient.throttledGet('/wallet-bot/me')
    action.value = response.data?.data?.is_withdraw_beset ? 'modify' : 'set'
  } catch {
    action.value = 'set' // 失败也默认 set
  }
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  padding: 16px;
  box-sizing: border-box;
}

/* 设置卡片 */
.settings-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(31,45,61,0.08);
  max-width: 480px;
  margin: 0 auto;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--tg-text);
}

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* 设置项 */
.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s;
  border-radius: 8px;
  margin: 0 -8px;
  padding: 16px 8px;
}

.settings-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.settings-item:active {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 左边部分 */
.item-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(64, 158, 255, 0.1);
  color: var(--tg-accent);
  flex-shrink: 0;
}

.item-icon svg {
  color: var(--tg-accent);
}

/* 第二个设置项不同的图标颜色 */
.settings-item:nth-child(2) .item-icon {
  background: rgba(16, 185, 129, 0.1);
}

.settings-item:nth-child(2) .item-icon svg {
  color: #10b981;
}

/* 第三个设置项不同的图标颜色 */
.settings-item:nth-child(3) .item-icon {
  background: rgba(245, 158, 11, 0.1);
}

.settings-item:nth-child(3) .item-icon svg {
  color: #f59e0b;
}

/* 第四个设置项不同的图标颜色 */
.settings-item:nth-child(4) .item-icon {
  background: rgba(139, 92, 246, 0.1);
}

.settings-item:nth-child(4) .item-icon svg {
  color: #8b5cf6;
}

/* 第五个设置项不同的图标颜色 */
.settings-item:nth-child(5) .item-icon {
  background: rgba(107, 114, 128, 0.1);
}

.settings-item:nth-child(5) .item-icon svg {
  color: #6b7280;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--tg-text);
}

.item-desc {
  font-size: 13px;
  color: var(--tg-text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* 右边箭头 */
.item-right {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--tg-text-secondary);
  flex-shrink: 0;
}

/* 分割线 */
.settings-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 420px) {
  .settings-page {
    padding: 0;
  }
  
  .settings-card {
    padding: 16px;
    border-radius: 0;
  }
  
  .card-header {
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  
  .settings-item {
    padding: 14px 8px;
  }
  
  .item-icon {
    width: 36px;
    height: 36px;
  }
  
  .item-title {
    font-size: 15px;
  }
  
  .item-desc {
    font-size: 12px;
  }
}
</style>