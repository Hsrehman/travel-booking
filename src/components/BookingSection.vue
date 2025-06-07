<template>
  <div class="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <!-- Trip Type Buttons -->
        <div class="flex space-x-2 mb-4">
          <button 
            @click="setTripType('oneWay')"
            :class="[
              'px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              tripType === 'oneWay' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >One Way</button>
          <button 
            @click="setTripType('return')"
            :class="[
              'px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              tripType === 'return' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >Return</button>
          <button 
            @click="setTripType('multiCity')"
            :class="[
              'px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              tripType === 'multiCity' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >Multi City</button>
        </div>
        <!-- Search Form -->
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <!-- From Field -->
            <div class="flex-[0.8] relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
              <div class="relative">
                <input
                  type="text"
                  v-model="fromQuery"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City or Airport"
                  @focus="showFromResults = true"
                  @blur="hideFromResults"
                >
                <div v-if="showFromResults && fromResults.length > 0" class="search-results">
                  <div
                    v-for="result in fromResults"
                    :key="result.iataCode"
                    class="search-result-item"
                    @mousedown="selectFromLocation(result)"
                  >
                    <div class="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.64 14.26l2.86.95 4.02-4.02-8-4.59 1.16-1.16c.1-.1.26-.14.41-.1l9.3 2.98c1.58-1.58 3.15-3.2 4.77-4.75.31-.33.7-.58 1.16-.73.45-.16.94-.2 1.42-.13.48.07.94.26 1.34.53.4.28.73.64.97 1.07.24.42.37.89.38 1.37.01.48-.1.95-.32 1.38-.22.43-.54.79-.92 1.06l-4.82 4.83 2.97 9.29c.05.15 0 .31-.1.41l-1.17 1.16-4.57-8.02L8.8 17.5l.95 2.84L8.3 21.8l-2.5-5.5-5.5-2.5 1.34-1.34z"/>
                      </svg>
                      <div>
                        <div class="text-[11px] font-medium text-gray-900">{{ result.mainLine }}</div>
                        <div class="text-[10px] text-gray-500">{{ result.subLine }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Switch Button -->
            <div class="flex items-center justify-center relative z-10">
              <button 
                @click="switchLocations"
                class="p-2 bg-white rounded-full shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            <!-- To Field -->
            <div class="flex-[0.8] relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
              <div class="relative">
                <input
                  type="text"
                  v-model="toQuery"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City or Airport"
                  @focus="showToResults = true"
                  @blur="hideToResults"
                >
                <div v-if="showToResults && toResults.length > 0" class="search-results">
                  <div
                    v-for="result in toResults"
                    :key="result.iataCode"
                    class="search-result-item"
                    @mousedown="selectToLocation(result)"
                  >
                    <div class="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.64 14.26l2.86.95 4.02-4.02-8-4.59 1.16-1.16c.1-.1.26-.14.41-.1l9.3 2.98c1.58-1.58 3.15-3.2 4.77-4.75.31-.33.7-.58 1.16-.73.45-.16.94-.2 1.42-.13.48.07.94.26 1.34.53.4.28.73.64.97 1.07.24.42.37.89.38 1.37.01.48-.1.95-.32 1.38-.22.43-.54.79-.92 1.06l-4.82 4.83 2.97 9.29c.05.15 0 .31-.1.41l-1.17 1.16-4.57-8.02L8.8 17.5l.95 2.84L8.3 21.8l-2.5-5.5-5.5-2.5 1.34-1.34z"/>
                      </svg>
                      <div>
                        <div class="text-[11px] font-medium text-gray-900">{{ result.mainLine }}</div>
                        <div class="text-[10px] text-gray-500">{{ result.subLine }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Date Fields Container -->
            <div class="flex-[1.4] relative">
              <div class="flex space-x-4">
                <!-- Departure Date -->
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                  <div
                    @click="openDatePicker('departure')"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 focus:outline-none"
                  >
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-gray-700">{{ departureDate || 'Select' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Return Date (only shown for return trips) -->
                <div v-if="tripType !== 'oneWay'" class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Return</label>
                  <div
                    @click="openDatePicker('return')"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 focus:outline-none"
                  >
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-gray-700">{{ returnDate || 'Select' }}</span>
                    </div>
                  </div>
                </div>
                <!-- Spacer div when in one-way mode to maintain layout -->
                <div v-else class="flex-1"></div>
              </div>
              
              <!-- Class and Passengers Selection -->
              <div class="flex items-center space-x-4 mt-4">
                <!-- Cabin Class Dropdown -->
                <div class="flex-1 relative">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <div class="relative">
                    <button 
                      @click="toggleCabinDropdown"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <span>{{ cabinClassDisplay }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <!-- Cabin Class Dropdown Menu -->
                    <div v-if="showCabinDropdown" class="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                      <div class="p-2">
                        <div 
                          v-for="option in cabinOptions" 
                          :key="option.value"
                          @click="selectCabinClass(option.value)"
                          class="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                        >
                          <div class="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center mr-2">
                            <div v-if="cabinClass === option.value" class="h-2 w-2 rounded-full bg-blue-500"></div>
                          </div>
                          <span>{{ option.label }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Passengers Dropdown -->
                <div class="flex-1 relative">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                  <div class="relative">
                    <button 
                      @click="togglePassengersDropdown"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <span>{{ passengersDisplay }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <!-- Passenger Selection Dropdown -->
                    <div v-if="showPassengersDropdown" class="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                      <div class="p-4 space-y-4">
                        <!-- Adults -->
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="font-medium">Adults</div>
                            <div class="text-xs text-gray-500">12 years and above</div>
                          </div>
                          <div class="flex items-center space-x-3">
                            <button 
                              @click.prevent="decrementPassenger('adults')"
                              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center" 
                              :class="{ 'opacity-50 cursor-not-allowed': passengers.adults <= 1 }"
                              :disabled="passengers.adults <= 1"
                            >
                              <span class="text-xl leading-none">−</span>
                            </button>
                            <span class="w-4 text-center">{{ passengers.adults }}</span>
                            <button 
                              @click.prevent="incrementPassenger('adults')"
                              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                              :class="{ 'opacity-50 cursor-not-allowed': totalPassengers >= 9 }"
                              :disabled="totalPassengers >= 9"
                            >
                              <span class="text-xl leading-none">+</span>
                            </button>
                          </div>
                        </div>
                        
                        <!-- Children -->
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="font-medium">Children</div>
                            <div class="text-xs text-gray-500">2 to 11 years</div>
                          </div>
                          <div class="flex items-center space-x-3">
                            <button 
                              @click.prevent="decrementPassenger('children')"
                              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center" 
                              :class="{ 'opacity-50 cursor-not-allowed': passengers.children <= 0 }"
                              :disabled="passengers.children <= 0"
                            >
                              <span class="text-xl leading-none">−</span>
                            </button>
                            <span class="w-4 text-center">{{ passengers.children }}</span>
                            <button 
                              @click.prevent="incrementPassenger('children')"
                              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                              :class="{ 'opacity-50 cursor-not-allowed': totalPassengers >= 9 }"
                              :disabled="totalPassengers >= 9"
                            >
                              <span class="text-xl leading-none">+</span>
                            </button>
                          </div>
                        </div>
                        
                        <!-- Infants -->
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="font-medium">Infants</div>
                            <div class="text-xs text-gray-500">7 days to 23 months</div>
                          </div>
                          <div class="flex items-center space-x-3">
                            <button 
                              @click.prevent="decrementPassenger('infants')"
                              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center" 
                              :class="{ 'opacity-50 cursor-not-allowed': passengers.infants <= 0 }"
                              :disabled="passengers.infants <= 0"
                            >
                              <span class="text-xl leading-none">−</span>
                            </button>
                            <span class="w-4 text-center">{{ passengers.infants }}</span>
                            <button 
                              @click.prevent="incrementPassenger('infants')"
                              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                              :class="{ 'opacity-50 cursor-not-allowed': passengers.infants >= passengers.adults || totalPassengers >= 9 }"
                              :disabled="passengers.infants >= passengers.adults || totalPassengers >= 9"
                            >
                              <span class="text-xl leading-none">+</span>
                            </button>
                          </div>
                        </div>
                        
                        <button 
                          @click="applyPassengers"
                          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Date Picker Overlay -->
              <Transition name="fade">
                <div v-if="showDatePicker" class="date-picker-wrapper">
                  <div class="date-picker-container">
                    <Datepicker
                      v-model="dates"
                      :range="tripType !== 'oneWay'"
                      :enable-time-picker="false"
                      :min-date="new Date()"
                      auto-apply
                      inline
                      :month-change-on-scroll="false"
                      :two-months="tripType !== 'oneWay'"
                      :multi-calendars="tripType !== 'oneWay'"
                      :calendar-cell-class-name="'dp__calendar-item'"
                      @closed="closeDatePicker"
                      @update:model-value="handleDateSelection"
                    />
                  </div>
                </div>
              </Transition>

              <!-- Overlay Background -->
              <Transition name="fade">
                <div v-if="showDatePicker" class="fixed inset-0 bg-black bg-opacity-30 z-40" @click="closeDatePicker"></div>
              </Transition>
            </div>
          </div>

          <!-- Search Button -->
          <div class="flex justify-center mt-6">
            <button
              @click="handleSearch"
              class="px-12 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
            >
              Search Flights
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { searchAirports } from '../utils/api';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const emit = defineEmits(['search']);

// Search form data
const fromQuery = ref('');
const toQuery = ref('');
const dates = ref(null);
const tripType = ref('return');

// Cabin class options
const cabinClass = ref('E'); // Default to Economy
const showCabinDropdown = ref(false);
const cabinOptions = [
  { value: 'E', label: 'Economy' },
  { value: 'B', label: 'Business' },
  { value: 'F', label: 'First' }
];

// Passengers data
const passengers = ref({
  adults: 1,
  children: 0,
  infants: 0
});
const showPassengersDropdown = ref(false);

// Search results
const fromResults = ref([]);
const toResults = ref([]);
const selectedFromLocation = ref(null);
const selectedToLocation = ref(null);
const showFromResults = ref(false);
const showToResults = ref(false);

// Debounce timeouts
let fromSearchTimeout = null;
let toSearchTimeout = null;

// Debounced search for From field
const debounceFromSearch = (newQuery) => {
  if (fromSearchTimeout) {
    window.clearTimeout(fromSearchTimeout);
  }
  if (newQuery.length >= 2) {
    fromSearchTimeout = window.setTimeout(async () => {
      try {
        const results = await searchAirports(newQuery);
        fromResults.value = results;
      } catch (error) {
        console.error('Error searching airports:', error);
        fromResults.value = [];
      }
    }, 300);
  } else {
    fromResults.value = [];
  }
};

// Debounced search for To field
const debounceToSearch = (newQuery) => {
  if (toSearchTimeout) {
    window.clearTimeout(toSearchTimeout);
  }
  if (newQuery.length >= 2) {
    toSearchTimeout = window.setTimeout(async () => {
      try {
        const results = await searchAirports(newQuery);
        toResults.value = results;
      } catch (error) {
        console.error('Error searching airports:', error);
        toResults.value = [];
      }
    }, 300);
  } else {
    toResults.value = [];
  }
};

// Watch queries and trigger debounced search
watch(fromQuery, debounceFromSearch);
watch(toQuery, debounceToSearch);

// Format date for display (UI) or API
function formatDate(date, forApi = false) {
  if (!date || !(date instanceof Date)) return '';
  
  try {
    if (forApi) {
      // API format: YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      // Display format: DD/MM/YYYY
      const formatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return formatter.format(date);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

// Computed properties for departure and return dates (using display format DD/MM/YYYY)
const departureDate = computed(() => {
  if (tripType.value === 'oneWay') {
    // For one-way trips, dates.value is a single date object
    if (!dates.value || dates.value.getTime() === 0) return '';
    return formatDate(dates.value, false); // using display format
  } else {
    // For return trips, dates.value is an array of dates
    if (!dates.value?.[0] || (dates.value[0] && dates.value[0].getTime() === 0)) return '';
    return formatDate(dates.value[0], false); // using display format
  }
});

const returnDate = computed(() => {
  if (tripType.value === 'oneWay') {
    return ''; // No return date for one-way trips
  } else {
    if (!dates.value?.[1] || (dates.value[1] && dates.value[1].getTime() === 0)) return '';
    return formatDate(dates.value[1], false); // using display format
  }
});

// Computed properties for cabin class and passengers display
const cabinClassDisplay = computed(() => {
  const selectedOption = cabinOptions.find(option => option.value === cabinClass.value);
  return selectedOption ? selectedOption.label : 'Economy';
});

const totalPassengers = computed(() => {
  return passengers.value.adults + passengers.value.children + passengers.value.infants;
});

const passengersDisplay = computed(() => {
  let display = `${passengers.value.adults} Adult`;
  if (passengers.value.adults > 1) display += 's';
  
  if (passengers.value.children > 0) {
    display += `, ${passengers.value.children} Child`;
    if (passengers.value.children > 1) display += 'ren';
  }
  
  if (passengers.value.infants > 0) {
    display += `, ${passengers.value.infants} Infant`;
    if (passengers.value.infants > 1) display += 's';
  }
  
  return display;
});

// Toggle functions for dropdowns
function toggleCabinDropdown() {
  showCabinDropdown.value = !showCabinDropdown.value;
  if (showCabinDropdown.value) {
    showPassengersDropdown.value = false;
  }
}

function togglePassengersDropdown() {
  showPassengersDropdown.value = !showPassengersDropdown.value;
  if (showPassengersDropdown.value) {
    showCabinDropdown.value = false;
  }
}

// Cabin class selection
function selectCabinClass(value) {
  cabinClass.value = value;
  showCabinDropdown.value = false;
}

// Passenger management functions
function incrementPassenger(type) {
  if (totalPassengers.value >= 9) return;
  
  if (type === 'infants' && passengers.value.infants >= passengers.value.adults) {
    // Can't have more infants than adults
    return;
  }
  
  passengers.value[type]++;
}

function decrementPassenger(type) {
  if (type === 'adults' && passengers.value.adults <= 1) return;
  if (type !== 'adults' && passengers.value[type] <= 0) return;
  
  // If reducing adults would make it less than infants, reduce infants too
  if (type === 'adults' && (passengers.value.adults - 1) < passengers.value.infants) {
    passengers.value.infants = passengers.value.adults - 1;
  }
  
  passengers.value[type]--;
}

function applyPassengers() {
  showPassengersDropdown.value = false;
}

// Handle search submission
function handleSearch() {
  if (!selectedFromLocation.value || !selectedToLocation.value || !dates.value) {
    alert('Please fill in all required fields');
    return;
  }

  // Convert passenger counts to the format expected by the API
  const passengersList = [];
  
  if (passengers.value.adults > 0) {
    passengersList.push({
      type: 'adult',
      count: passengers.value.adults,
      age: 30 // Default adult age
    });
  }
  
  if (passengers.value.children > 0) {
    passengersList.push({
      type: 'child',
      count: passengers.value.children,
      age: 8 // Default child age
    });
  }
  
  if (passengers.value.infants > 0) {
    passengersList.push({
      type: 'infant',
      count: passengers.value.infants,
      age: 1 // Default infant age
    });
  }

  const searchParams = {
    from: selectedFromLocation.value.iataCode,
    to: selectedToLocation.value.iataCode,
    departDate: formatDate(Array.isArray(dates.value) ? dates.value[0] : dates.value, true), // API format
    returnDate: Array.isArray(dates.value) && dates.value[1] ? formatDate(dates.value[1], true) : null, // API format
    passengers: passengersList,
    cabin: cabinClass.value
  };

  emit('search', searchParams);
}

// Function to set trip type
function setTripType(type) {
  tripType.value = type;
  
  // Reset dates when changing trip type
  if (type === 'oneWay') {
    // For one-way, convert to single date if we had a range before
    if (Array.isArray(dates.value) && dates.value.length > 0) {
      dates.value = dates.value[0];
      // If the date is invalid (Jan 1, 1970), set to null
      if (dates.value && dates.value.getTime() === 0) {
        dates.value = null;
      }
    }
  } else if (type === 'return') {
    // For return, convert to array if we had a single date
    if (!Array.isArray(dates.value)) {
      if (dates.value) {
        // If the date is invalid (Jan 1, 1970), set to null
        if (dates.value.getTime() === 0) {
          dates.value = [null, null];
        } else {
          dates.value = [dates.value, null];
        }
      } else {
        dates.value = [null, null];
      }
    }
  } else if (type === 'multiCity') {
    // For multi-city, we'd implement additional logic here
    // This is a placeholder for future implementation
    alert('Multi-city booking is not implemented yet');
    tripType.value = 'return'; // Fallback to return for now
  }
}

// Select location handlers
function selectFromLocation(location) {
  selectedFromLocation.value = location;
  fromQuery.value = `${location.cityName} (${location.iataCode})`;
  showFromResults.value = false;
}

function selectToLocation(location) {
  selectedToLocation.value = location;
  toQuery.value = `${location.cityName} (${location.iataCode})`;
  showToResults.value = false;
}

// Switch locations function
const switchLocations = () => {
  // Switch the queries
  const tempQuery = fromQuery.value;
  fromQuery.value = toQuery.value;
  toQuery.value = tempQuery;

  // Switch the selected locations
  const tempLocation = selectedFromLocation.value;
  selectedFromLocation.value = selectedToLocation.value;
  selectedToLocation.value = tempLocation;
};

// Blur handler functions
function hideFromResults() {
  window.setTimeout(() => {
    showFromResults.value = false;
  }, 200);
}

function hideToResults() {
  window.setTimeout(() => {
    showToResults.value = false;
  }, 200);
}

// Date picker state
const showDatePicker = ref(false);
const activeDateInput = ref(null);
const datePickerPosition = ref({});

// Date picker handlers
function openDatePicker(type) {
  activeDateInput.value = type;
  showDatePicker.value = true;
}

function closeDatePicker() {
  showDatePicker.value = false;
  activeDateInput.value = null;
}

function handleDateSelection(selectedDates) {
  if (tripType.value === 'oneWay') {
    // For one-way trips, we get a single date
    if (selectedDates) {
      // Don't modify computed values directly, just update the dates ref
      // The computed properties will handle the display
      dates.value = selectedDates;
      closeDatePicker();
    }
  } else {
    // For return trips, we get an array of two dates
    if (selectedDates && selectedDates.length === 2) {
      // Don't modify computed values directly, just update the dates ref
      // The computed properties will handle the display
      dates.value = selectedDates;
      closeDatePicker();
    }
  }
}

onMounted(() => {
  console.log('BookingSection mounted');
});
</script>

<style>
.booking-section {
  background-color: #ffffff;
  border-radius: 12px;
}

.loading {
  opacity: 0.7;
  pointer-events: none;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 50;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f3f4f6;
  transform: translateX(4px);
}

/* Emoji and icon styles */
.search-result-item :deep(span) {
  display: inline-block;
  margin-right: 0.25rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Date picker customization */
.date-picker-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 50;
  margin-top: 8px;
}

.date-picker-container {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 518px;
}

:deep(.dp__input_wrap) {
  display: none;  /* Hide the default input */
}

:deep(.dp__main) {
  border: none;
  width: 100%;
}

:deep(.dp__menu) {
  box-shadow: none !important;
  border: none !important;
  position: static !important;
  transform: none !important;
  width: 100% !important;
  padding: 16px !important;
}

:deep(.dp__flex_display) {
  display: flex !important;
  gap: 24px !important;
  justify-content: flex-start !important;
  padding-left: 16px !important;
}

:deep(.dp__calendar) {
  width: 220px !important;
}

:deep(.dp__calendar_item) {
  width: 28px !important;
  height: 28px !important;
  font-size: 13px !important;
  margin: 1px !important;
}

:deep(.dp__month_year_row) {
  margin: 8px 0 !important;
}

:deep(.dp__month_year_wrap) {
  width: 100% !important;
  justify-content: center !important;
}

:deep(.dp__month_year_select) {
  font-weight: 600 !important;
}

:deep(.dp__today) {
  border: 1px solid #2563eb !important;
}

:deep(.dp__active_date) {
  background: #2563eb !important;
}

:deep(.dp__range_between) {
  background: #e5edff !important;
  color: #2563eb !important;
}

:deep(.dp__range_start, .dp__range_end) {
  background: #2563eb !important;
  color: white !important;
}

:deep(.dp__action_buttons) {
  display: none !important;
}

/* Scrollbar styles */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
