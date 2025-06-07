<template>
  <div class="p-4 bg-blue-500 text-white">
    Test Component
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Test component mounted')
})
</script>
