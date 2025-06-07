<template>
  <div class="loading-overlay" v-if="show">
    <div class="loading-content">
      <div class="spinner"></div>
      <div class="loading-text">{{ text || 'Searching for the best flights...' }}</div>
      <div class="loading-subtext">This may take a few moments</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0066cc;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.loading-subtext {
  font-size: 0.875rem;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
