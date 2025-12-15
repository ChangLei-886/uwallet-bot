<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="iconClass" aria-hidden="true">
    <circle cx="12" cy="8" r="3" :fill="stroke" />
    <path d="M5 20c1.5-3 4.5-4 7-4s5.5 1 7 4" :stroke="stroke" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </svg>
</template>

<script setup>
const props = defineProps({
  size: { type: [String, Number], default: 18 },
  stroke: { type: String, default: 'currentColor' },
  strokeWidth: { type: [String, Number], default: 1.4 },
  iconClass: { type: String, default: '' }
})
</script>

<style scoped>
svg { display:block }
</style>
