<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Main Content -->
    <main>
      <!-- Booking Section -->
      <div class="py-8">
        <BookingSection @search="handleSearch" />
      </div>

      <!-- Featured Destinations -->
      <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-8">Popular Destinations</h3>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div v-for="destination in destinations" :key="destination.name" class="rounded-lg overflow-hidden shadow-lg">
            <img :src="destination.image" :alt="destination.name" class="w-full h-48 object-cover">
            <div class="p-4">
              <h4 class="text-xl font-semibold">{{ destination.name }}</h4>
              <p class="text-gray-600">{{ destination.description }}</p>
              <p class="mt-2 text-blue-600 font-semibold">From ${{ destination.price }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookingSection from '../components/BookingSection.vue'

const router = useRouter()

const destinations = [
  {
    name: 'Paris, France',
    description: 'The city of lights and romance',
    price: 799,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500'
  },
  {
    name: 'Bali, Indonesia',
    description: 'Tropical paradise with stunning beaches',
    price: 899,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=500'
  },
  {
    name: 'Dubai, UAE',
    description: 'Modern luxury in the desert',
    price: 999,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=500'
  }
]

onMounted(() => {
  console.log('HomePage mounted')
})

function handleSearch(searchParams) {
  // Navigate to flight results with search parameters
  router.push({
    name: 'flight-results',
    query: searchParams
  })
}
</script>
