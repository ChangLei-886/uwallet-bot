<template>
  <!-- 弹窗遮罩层 -->
  <div v-if="visible" class="dialog-overlay" @click.self="handleCancel">
    <div class="dialog-container">
      <!-- 弹窗头部 -->
      <div class="dialog-header">
        <h2 class="dialog-title">验证提现密码</h2>
        <button class="dialog-close" @click="handleCancel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <!-- 弹窗内容 -->
      <div class="dialog-content">
        <!-- 金额显示 -->
        <div class="amount-display" v-if="amount">
          <div class="amount-label">提现金额</div>
          <div class="amount-value">{{ amount }} USDT</div>
        </div>
        
        <!-- 密码输入 -->
        <div class="password-input-section">
          <label class="input-label">提现密码</label>
          <div class="password-input-container">
            <input
              ref="passwordInput"
              v-model="password"
              type="password"
              placeholder="请输入6位数字密码"
              class="password-input"
              maxlength="6"
              inputmode="numeric"  <!-- 移动端会弹出数字键盘 -->
              pattern="[0-9]*"
              @keyup.enter="handleConfirm"
            />
          </div>
          <div class="input-hint" :class="{ 'error': error }">
            {{ error || '请输入6位数字密码' }}
          </div>
        </div>
      </div>
      
      <!-- 弹窗底部 -->
      <div class="dialog-footer">
        <button class="btn btn-cancel" @click="handleCancel">取消</button>
        <button class="btn btn-confirm" @click="handleConfirm" :disabled="!isValid">
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  amount: {
    type: [String, Number],
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// 响应式数据
const password = ref('')
const error = ref('')
const passwordInput = ref(null)

// 计算属性
const isValid = computed(() => {
  return password.value.length === 6 && /^\d+$/.test(password.value)
})

// 监听显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 显示时清空密码和错误信息
    password.value = ''
    error.value = ''
    
    // 聚焦输入框
    nextTick(() => {
      if (passwordInput.value) {
        passwordInput.value.focus()
      }
    })
  }
})

// 确认验证
const handleConfirm = async () => {
  if (!isValid.value) {
    error.value = '请输入6位数字密码'
    return
  }
  
  try {
    // 这里可以调用API验证密码
    // const response = await apiClient.post('/verify-withdraw-password', {
    //   password: password.value,
    //   amount: props.amount
    // })
    
    // 验证成功，传递密码给父组件
    emit('confirm', password.value)
    closeDialog()
    
  } catch (err) {
    // 验证失败
    error.value = err.response?.data?.message || '密码错误'
    password.value = ''
    
    // 重新聚焦输入框
    nextTick(() => {
      if (passwordInput.value) {
        passwordInput.value.focus()
      }
    })
  }
}

// 取消
const handleCancel = () => {
  emit('cancel')
  closeDialog()
}

// 关闭弹窗
const closeDialog = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 16px;
  animation: fadeIn 0.2s ease;
}

.dialog-container {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 弹窗头部 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--tg-text);
}

.dialog-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--tg-text-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.dialog-close:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--tg-text);
}

/* 弹窗内容 */
.dialog-content {
  padding: 24px;
}

/* 金额显示 */
.amount-display {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.amount-label {
  font-size: 13px;
  color: var(--tg-text-secondary);
  margin-bottom: 6px;
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--tg-text);
}

/* 密码输入区域 */
.password-input-section {
  margin-bottom: 8px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--tg-text);
  margin-bottom: 10px;
}

.password-input-container {
  position: relative;
}

.password-input {
  width: 100%;
  padding: 18px 20px;
  border: 1px solid #e6eef8;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--tg-text);
  background: #f8fafc;
  text-align: center;
  letter-spacing: 8px;
  transition: all 0.2s;
}

.password-input:focus {
  outline: none;
  border-color: var(--tg-accent);
  background: white;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.password-input::placeholder {
  color: var(--tg-text-secondary);
  opacity: 0.4;
  letter-spacing: normal;
}

/* 输入提示 */
.input-hint {
  font-size: 12px;
  color: var(--tg-text-secondary);
  margin-top: 8px;
  min-height: 16px;
}

.input-hint.error {
  color: #ef4444;
}

/* 弹窗底部 */
.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f5f7fa;
  color: var(--tg-text);
}

.btn-cancel:hover {
  background: #e6eef8;
}

.btn-confirm {
  background: var(--tg-accent);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #1d7ef0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.btn-confirm:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 420px) {
  .dialog-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .dialog-container {
    border-radius: 20px 20px 0 0;
    max-width: 100%;
    animation: slideUp 0.3s ease;
  }
  
  .dialog-header {
    padding: 16px 20px;
  }
  
  .dialog-content {
    padding: 20px;
  }
  
  .amount-value {
    font-size: 22px;
  }
  
  .password-input {
    padding: 16px 20px;
    font-size: 18px;
  }
  
  .dialog-footer {
    padding: 16px 20px;
  }
  
  .btn {
    padding: 14px;
    font-size: 15px;
  }
}
</style>