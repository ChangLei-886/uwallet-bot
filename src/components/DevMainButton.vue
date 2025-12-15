<template>
  <button v-if="visible" class="dev-main-btn" :disabled="disabled" @click="trigger">
    {{ text || '主操作' }}
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import telegram from '../lib/telegram'

const text = ref('')
const visible = ref(false)
const disabled = ref(false)

function refreshState() {
  const s = telegram.MainButton._devState && telegram.MainButton._devState()
  if (s) {
    text.value = s.text
    visible.value = s.visible
    disabled.value = s.disabled
  } else {
    visible.value = false
  }
}

function trigger() {
  // call the wrapper dev trigger
  if (telegram.MainButton._devTrigger) telegram.MainButton._devTrigger()
}

onMounted(() => {
  refreshState()
  // poll once per 500ms to reflect changes from pages during development
  const id = setInterval(refreshState, 500)
  // stop polling when component unmounts
  onUnmounted(() => clearInterval(id))
})
</script>

<style scoped>
.dev-main-btn {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 18px;
  padding: 12px 18px;
  background: var(--tg-accent, #409eff);
  color: white;
  border: none;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(64,158,255,0.18);
  font-weight: 600;
  z-index: 9999;
}
.dev-main-btn:disabled { opacity: 0.6 }
</style>
