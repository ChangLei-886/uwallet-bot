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

function show(msg, ms = 2000) {
  message.value = msg
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (visible.value = false), ms)
}

onMounted(() => {
  window.addEventListener('app:toast', (e) => {
    const txt = e?.detail || String(e)
    show(txt)
  })
})
</script>

<style scoped>
.toast-wrap { position: fixed; left:50%; transform:translateX(-50%); bottom:80px; z-index:9999; pointer-events:none }
.toast { background: rgba(0,0,0,0.85); color:#fff; padding:10px 14px; border-radius:12px; font-size:14px; opacity:0; transform:translateY(6px); transition:opacity .22s ease, transform .22s ease; pointer-events:auto }
.toast-wrap .toast { opacity:1; transform:translateY(0) }
</style>
