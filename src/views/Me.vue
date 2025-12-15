<template>
  <div class="page">
    <h2>我的</h2>
    <p>显示名：<strong>{{ displayName }}</strong></p>
    <p>钱包余额（模拟）：<strong>{{ balance }}</strong></p>
    <h3>最近操作（示例）</h3>
    <ul>
      <li v-for="(t, i) in transactions" :key="i">{{ t }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const displayName = ref('示例用户')
const balance = ref('1000.00 USDT')
const transactions = ref([
  '充值：100.00 USDT',
  '提现：50.00 USDT',
])
</script>

<style scoped>
.page { padding:12px }
.page .card { padding:12px }
</style>
