<template>
  <div class="page">
    <h2>提现</h2>
    <form @submit.prevent="onSubmit">
      <label>
        金额
        <input v-model="amount" type="number" step="0.01" min="0.01" required />
      </label>
      <label>
        提现地址
        <input v-model="address" type="text" required />
      </label>
      <label>
        备注
        <input v-model="memo" type="text" />
      </label>
      <div class="actions">
        <button type="submit">提交提现</button>
      </div>
    </form>
    <div v-if="result" class="result">{{ result }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import telegram from '../lib/telegram'

const amount = ref('')
const address = ref('')
const memo = ref('')
const result = ref('')

let mainHandler = null

function validate() {
  const a = parseFloat(amount.value)
  if (Number.isNaN(a) || a <= 0) {
    return '请输入大于0的金额'
  }
  if (String(address.value).trim().length < 8) {
    return '请输入有效的提现地址（模拟校验）'
  }
  return ''
}

function onSubmit() {
  const err = validate()
  if (err) {
    result.value = err
    return
  }
  const payload = JSON.stringify({ type: 'withdraw', amount: amount.value, address: address.value, memo: memo.value })
  telegram.sendData(payload)
  result.value = `已提交提现请求：${amount.value} 至 ${address.value}`
}

function onSubmitFromMainButton() {
  onSubmit()
}

onMounted(() => {
  telegram.init()
  telegram.MainButton.setText('提交提现')
  telegram.MainButton.show()
  telegram.MainButton.enable()
  mainHandler = onSubmitFromMainButton
  telegram.MainButton.onClick(mainHandler)
})

onUnmounted(() => {
  if (mainHandler) telegram.MainButton.offClick(mainHandler)
  telegram.MainButton.hide()
})
</script>

<style scoped>
.page { padding: 12px }
label { display:block; margin:10px 0 }
input { width:100%; padding:10px; border-radius:8px; border:1px solid #eef6ff; box-sizing:border-box }
.actions { margin-top:14px }
button { padding:10px 14px; border-radius:10px }
.result { margin-top:12px; color: green }
</style>
