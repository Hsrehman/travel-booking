<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link :to="{ name: 'home' }" class="text-2xl font-bold text-blue-600">TravelEase</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link :to="{ name: 'home' }" class="text-gray-700 hover:text-blue-600">Home</router-link>
            <router-link :to="{ name: 'flight-results' }" class="text-gray-700 hover:text-blue-600">Flights</router-link>
            <a href="#" class="text-gray-700 hover:text-blue-600">Hotels</a>
            <a href="#" class="text-gray-700 hover:text-blue-600">Contact</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Router View -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

onMounted(() => {
  console.log('App mounted')
})
</script>
