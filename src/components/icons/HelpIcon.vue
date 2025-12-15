<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="iconClass" aria-hidden="true">
    <circle cx="12" cy="12" r="10" :stroke="stroke" :stroke-width="strokeWidth" :fill="fillColor" />
    <path d="M10.8 8.5c.2-.9.9-1.4 1.9-1.4 1.1 0 2 .7 2 1.8 0 .9-.5 1.4-1 1.8-.6.5-1 1-1 2" :stroke="stroke" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="12" cy="16.2" r="0.9" :fill="stroke" />
  </svg>
</template>

<script setup>
const props = defineProps({
  size: { type: [String, Number], default: 18 },
  stroke: { type: String, default: 'currentColor' },
  fillColor: { type: String, default: 'rgba(64,158,255,0.06)' },
  strokeWidth: { type: [String, Number], default: 1.4 },
  iconClass: { type: String, default: '' }
})
</script>

<style scoped>
svg { display:block }
</style>
