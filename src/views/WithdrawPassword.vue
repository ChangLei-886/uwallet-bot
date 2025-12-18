<template>
  <div class="withdraw-password-page">
    <!-- 设置卡片 -->
    <section class="settings-card">
      <div class="card-header">
        <div class="card-header-left">
          <h2 class="card-title">{{ isSetting ? '设置提现密码' : '修改提现密码' }}</h2>
        </div>
      </div>
      
      <!-- 密码设置区域 -->
      <div class="password-section">
        <div class="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="10" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/>
            <path d="M7 10V6a5 5 0 0 1 5-5v0a5 5 0 0 1 5 5v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
          </svg>
          <h3 class="section-title">提现密码{{ isSetting ? '设置' : '修改' }}</h3>
        </div>
        
        <!-- 原密码（修改时显示） -->
        <div class="input-group" v-if="!isSetting">
          <label class="input-label">原密码</label>
          <div class="password-input-container">
            <input
              v-model="originalPassword"
              :type="showOriginalPassword ? 'text' : 'password'"
              placeholder="请输入原密码"
              class="password-input"
              inputmode="numeric"
              maxlength="6"
            />
            <button class="toggle-password" @click="showOriginalPassword = !showOriginalPassword">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path v-if="showOriginalPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.2"/>
                <path v-if="showOriginalPassword" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" stroke-width="1.2"/>
                <path v-if="!showOriginalPassword" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                <line v-if="!showOriginalPassword" x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 新密码 -->
        <div class="input-group">
          <label class="input-label">{{ isSetting ? '设置密码' : '新密码' }}</label>
          <div class="password-input-container">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              :placeholder="isSetting ? '请设置提现密码' : '请输入新密码'"
              class="password-input"
              inputmode="numeric"
              maxlength="6"
            />
            <button class="toggle-password" @click="showNewPassword = !showNewPassword">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path v-if="showNewPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.2"/>
                <path v-if="showNewPassword" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" stroke-width="1.2"/>
                <path v-if="!showNewPassword" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                <line v-if="!showNewPassword" x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="password-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2"/>
              <path d="M12 8V12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            密码为6位数字
          </div>
        </div>
        
        <!-- 确认密码 -->
        <div class="input-group">
          <label class="input-label">确认密码</label>
          <div class="password-input-container">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              class="password-input"
              inputmode="numeric"
              maxlength="6"
            />
            <button class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path v-if="showConfirmPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.2"/>
                <path v-if="showConfirmPassword" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" stroke-width="1.2"/>
                <path v-if="!showConfirmPassword" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                <line v-if="!showConfirmPassword" x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 提交按钮 -->
      <div class="submit-section">
        <button 
          class="submit-btn" 
          @click="handleSubmit"
          :disabled="!isFormValid"
        >
          {{ isSetting ? '设置密码' : '修改密码' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../api/client'
import CryptoJS from 'crypto-js'

const route = useRoute()
const router = useRouter()

// 根据路由参数判断是设置还是修改
// 假设路由格式：/withdraw-password?action=set（设置）或 /withdraw-password?action=modify（修改）
const isSetting = computed(() => {
  return route.query.action === 'set'
})

// 响应式数据
const originalPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showOriginalPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 表单验证
const isFormValid = computed(() => {
  // 修改时需要验证原密码
  if (!isSetting.value && !originalPassword.value.trim()) {
    return false
  }
  
  // 新密码必须是6位数字
  if (!newPassword.value || newPassword.value.length !== 6 || !/^\d+$/.test(newPassword.value)) {
    return false
  }
  
  // 确认密码必须匹配
  if (newPassword.value !== confirmPassword.value) {
    return false
  }
  
  return true
})

// 提交处理
const handleSubmit = async () => {
  if (!isFormValid.value) {
    window.$toast('请填写正确的密码信息')
    return
  }
  
  try {
    // 调用API
    if (isSetting.value) {
      await apiClient.throttledPost('/wallet-bot/me/withdraw-password', {
        password: CryptoJS.MD5(newPassword.value).toString()
      })
    } else {
      await apiClient.throttledPut('/wallet-bot/me/withdraw-password', {
        origin_password: CryptoJS.MD5(originalPassword.value).toString(),
        password: CryptoJS.MD5(newPassword.value).toString()
      })
    }    
    // 成功提示
    window.$toast(isSetting.value ? '密码设置成功' : '密码修改成功', 3000)
    
    // 清空表单
    originalPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    
    if (isSetting.value) {
      console.log('Password set successfully')
      // 设置成功后返回上一页
      router.back()
    }
    
  } catch (error) {
    // 错误提示
    window.$toast(error.response?.data?.detail || '操作失败，请重试')
    
    // 清空密码输入
    originalPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  }
}

// 页面挂载时检查参数
onMounted(() => {
  // 如果没有action参数，默认使用设置模式
  if (!route.query.action) {
    // 可以在这里重定向到带参数的URL
    router.replace({ query: { action: 'set' } })
  }
  
  // 可以根据需要从API检查是否已有密码
  // checkPasswordStatus()
})
</script>

<style scoped>
.withdraw-password-page {
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

/* 密码设置区域 */
.password-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-header svg {
  color: var(--tg-accent);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--tg-text);
}

/* 输入组 */
.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--tg-text);
  margin-bottom: 8px;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  flex: 1;
  padding: 14px 16px;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  font-size: 18px;
  color: var(--tg-text);
  background: #f8fafc;
  transition: all 0.2s;
  padding-right: 50px;
  text-align: center;
  letter-spacing: 6px;
}

.password-input:focus {
  outline: none;
  border-color: var(--tg-accent);
  background: white;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.password-input::placeholder {
  color: var(--tg-text-secondary);
  opacity: 0.6;
  letter-spacing: normal;
}

.toggle-password {
  position: absolute;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--tg-text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: var(--tg-accent);
}

/* 密码提示 */
.password-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--tg-text-secondary);
  margin-top: 6px;
}

.password-hint svg {
  flex-shrink: 0;
}

/* 提交按钮 */
.submit-section {
  text-align: center;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px;
  background: var(--tg-accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
  background: linear-gradient(135deg, var(--tg-accent), #1d7ef0);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 420px) {
  .withdraw-password-page {
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
  
  .section-title {
    font-size: 15px;
  }
  
  .password-input {
    padding: 12px 14px;
    font-size: 16px;
  }
  
  .submit-btn {
    padding: 14px;
    font-size: 15px;
  }
}
</style>