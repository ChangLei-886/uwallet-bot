<template>
  <div class="page">
    <h2>设置</h2>
    <label>
      显示名
      <input v-model="displayName" />
    </label>
    <label>
      接收通知
      <input type="checkbox" v-model="notifications" />
    </label>
    <div class="actions">
      <button @click="save">保存设置</button>
    </div>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const displayName = ref('示例用户')
const notifications = ref(true)
const message = ref('')

function save() {
  message.value = '设置已保存（仅前端模拟）'
  setTimeout(() => (message.value = ''), 2000)
}
</script>

<style scoped>
.page { padding:12px }
label { display:block; margin:10px 0 }
input[type="checkbox"] { margin-left:8px }
.actions { margin-top:14px }
.message { color: green }
</style>
