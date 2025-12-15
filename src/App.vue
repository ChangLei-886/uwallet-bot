<template>
  <div id="app">
    <main class="app-main">
      <router-view />
    </main>
    <DevMainButton />
    <Toast />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import telegram from './lib/telegram'
import DevMainButton from './components/DevMainButton.vue'
import Toast from './components/Toast.vue'

// apply Telegram theme params (if available) as CSS variables
onMounted(() => {
  const theme = telegram.getThemeParams() || {}
  const accent = theme.accent_color || '#409eff'
  const bg = theme.background_color || '#ffffff'
  const text = theme.text_color || '#1f2d3d'
  document.documentElement.style.setProperty('--tg-accent', accent)
  document.documentElement.style.setProperty('--tg-bg', bg)
  document.documentElement.style.setProperty('--tg-text', text)
})

// when a static per-page entry sets this flag, hide global nav
const singleEntry = ref(window.__SINGLE_ENTRY || '')
</script>

<style>
:root {
  --tg-accent: #409eff;
  --tg-bg: #ffffff;
  --tg-text: #1f2d3d;
}
* { box-sizing: border-box }
body { margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial }
#app { min-height:100vh; background:var(--tg-bg); color:var(--tg-text) }
.app-header { padding:14px 16px; border-bottom:1px solid rgba(0,0,0,0.06); background:transparent }
.app-header h1 { margin:0; font-size:16px }
.app-nav { display:flex; gap:12px; padding:10px 12px; overflow:auto }
.app-nav a { color:var(--tg-text); text-decoration:none; padding:6px 8px; border-radius:8px }
.app-nav a.router-link-active { background:rgba(64,158,255,0.12); color:var(--tg-accent) }
.app-main { padding:12px }

/* general card/button styles used across views */
.card { background: #fff; border-radius:10px; padding:12px; box-shadow: 0 6px 18px rgba(0,0,0,0.04); margin-bottom:12px }
.btn { display:inline-block; padding:10px 14px; border-radius:10px; border:none; cursor:pointer }
.btn.primary { background:var(--tg-accent); color:#fff }
.muted { color:#6b7785 }

@media (max-width:480px) {
  .app-nav { gap:8px; padding:8px }
  .app-header h1 { font-size:15px }
}
</style>