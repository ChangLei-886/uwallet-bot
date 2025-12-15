<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
  </div>
</template>

<script setup>
defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.hello {
  margin: 20px 0;
  color: #42b983;
}
</style>