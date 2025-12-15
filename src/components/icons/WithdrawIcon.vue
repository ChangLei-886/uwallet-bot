<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="iconClass" aria-hidden="true">
    <path d="M4 12a8 8 0 0 0 16 0" :stroke="stroke" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M8 13l4-4 4 4" :stroke="stroke" :stroke-width="arrowWidth" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </svg>
</template>

<script setup>
const props = defineProps({
  size: { type: [String, Number], default: 18 },
  stroke: { type: String, default: 'currentColor' },
  strokeWidth: { type: [String, Number], default: 1.6 },
  arrowWidth: { type: [String, Number], default: 1.8 },
  iconClass: { type: String, default: '' }
})
</script>

<style scoped>
svg { display:block }
</style>
