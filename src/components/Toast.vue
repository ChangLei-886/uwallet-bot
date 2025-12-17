<template>
  <div class="toast-wrap" v-if="visible">
    <div class="toast">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)
const message = ref('')
let timer = null

// 显示toast的函数
const showToast = (msg, ms = 2000) => {
  message.value = msg
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (visible.value = false), ms)
}

// 组件挂载时注册到全局
onMounted(() => {
  // 注册到window对象
  window.$toast = showToast
  
  // 保持兼容的事件监听
  window.addEventListener('app:toast', (e) => {
    const detail = e?.detail
    if (typeof detail === 'object') {
      showToast(detail.message || detail, detail.duration || 2000)
    } else {
      showToast(String(detail || ''))
    }
  })
})
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 99999;
  pointer-events: none;
}

.toast {
  background: var(--tg-theme-bg-color, rgba(0, 0, 0, 0.9));
  color: var(--tg-theme-text-color, #fff);
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  max-width: calc(100vw - 40px);
  min-width: 120px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.toast-wrap .toast {
  opacity: 1;
  transform: translateY(0);
}
</style>