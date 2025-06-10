<template>
  <div class="min-h-screen" style="background: linear-gradient(160deg, #f8fafc 0%, #e0f2fe 100%);">
    <!-- Persistent Search Form -->  
    <div class="search-form-container bg-gray-50 border-b border-gray-200">
      <BookingSection 
        :initialSearchParams="transformSearchParams"
        @search-submitted="handleModifiedSearch"
      />
    </div>
    
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p class="mt-4 text-white">Searching for flights...</p>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="bg-white/90 border border-red-200 text-red-800 rounded-lg p-6 my-4">
        <p class="font-semibold">Error:</p>
        <p>{{ error }}</p>
        <div v-if="apiErrorDetails" class="mt-2 text-sm">
          <p class="font-medium">Additional details:</p>
          <p>{{ apiErrorDetails }}</p>
          <button 
            @click="retrySearch" 
            class="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry Search
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="flights.length > 0" class="space-y-6">
        <div class="mb-4 bg-white/90 p-4 rounded-lg">
          <p class="text-blue-800 font-medium">Found {{ flights.length }} flights for your search</p>
        </div>
        
        <FlightResults 
          :flights="processedFlights" 
          :search-params="searchParams"
          @flight-selected="selectFlight"
        />
            
      </div>
      
      <!-- No Results -->
      <div v-else class="bg-white/90 border border-gray-200 rounded-lg p-6 my-4 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-2xl font-semibold text-gray-900 mb-2">No Flights Available</p>
        <p class="text-gray-600">We couldn't find any flights matching your search criteria.</p>
        <p class="text-gray-600 mt-1">Please try different dates or airports.</p>
        <button 
          @click="$router.push('/')" 
          class="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Modify Search
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchFlights } from '../utils/api'
import FlightResults from '../components/FlightResults.vue'
import BookingSection from '../components/BookingSection.vue'

const route = useRoute()
const router = useRouter()

const flights = ref([])
const loading = ref(false)
const error = ref(null)
const apiErrorDetails = ref(null)
const searchParams = ref({})

// Process flights data for FlightResults component
const processedFlights = computed(() => {
  return flights.value.map(flight => {
    // Get first leg for departure, last leg for arrival
    const firstLeg = flight.outboundFlights[0] || {};
    const lastLeg = flight.outboundFlights[flight.outboundFlights.length - 1] || {};
    
    // Create segments array for multi-leg flights
    const segments = flight.outboundFlights.map(leg => {
      // Format departure and arrival times to ISO string format
      const departureDateTime = `${leg.departureDate}T${leg.departureTime}:00`;
      const arrivalDateTime = `${leg.arrivalDate}T${leg.arrivalTime}:00`;
      
      return {
        departureTime: departureDateTime,
        arrivalTime: arrivalDateTime,
        from: leg.departureCode,
        to: leg.destinationCode,
        airline: leg.airlineCode,
        flightNumber: leg.flightNumber,
        class: getCabinClassLabel(leg.cabinClass || 'E')
      };
    });
    
    return {
      id: flight.id,
      airlineCode: firstLeg.airlineCode,
      airlineName: getAirlineName(firstLeg.airlineCode),
      flightNumber: firstLeg.flightNumber,
      departureTime: firstLeg.departureDate && firstLeg.departureTime ? 
                    `${firstLeg.departureDate}T${firstLeg.departureTime}:00` : null,
      arrivalTime: lastLeg.arrivalDate && lastLeg.arrivalTime ? 
                  `${lastLeg.arrivalDate}T${lastLeg.arrivalTime}:00` : null,
      departureAirport: firstLeg.departureCode,
      arrivalAirport: lastLeg.destinationCode,
      duration: flight.outboundFlights.reduce((total, leg) => total + leg.duration, 0),
      stops: flight.outboundFlights.length - 1,
      price: flight.price,
      currency: flight.currency,
      layover: flight.outboundFlights.length > 1 ? {
        duration: firstLeg.connectionTime,
        airport: flight.outboundFlights[1].departureAirport
      } : null,
      segments: segments,
      // Include the baggage allowance information from the first leg
      baggageAllowance: firstLeg.baggageAllowance
    };
  });
})

onMounted(async () => {
  // Load search parameters from localStorage
  const storedParams = localStorage.getItem('flightSearchParams');
  
  if (storedParams) {
    searchParams.value = JSON.parse(storedParams);
  } else {
    // Fallback to URL parameters for backward compatibility
    searchParams.value = route.query;
  }

  console.log('Loaded search params:', searchParams.value);
  
  try {
    loading.value = true
    error.value = null
    apiErrorDetails.value = null
    
    // Map the parameters to match the API expectations
    const apiParams = {
      departureCode: searchParams.value.from || '',
      destinationCode: searchParams.value.to || '',
      departureDate: searchParams.value.departDate,
      returnDate: searchParams.value.returnDate,
      cabinClass: searchParams.value.cabin,
      passengers: {
        adults: parseInt(searchParams.value.adults) || 1,
        children: parseInt(searchParams.value.children) || 0,
        infants: parseInt(searchParams.value.infants) || 0
      }
    }
    
    console.log('Searching flights with params:', apiParams)
    const results = await searchFlights(apiParams)
    
    if (results.error) {
      error.value = 'Error retrieving flight information'
      apiErrorDetails.value = results.error
    } else {
      flights.value = results.flights
      if (flights.value.length === 0) {
        error.value = 'No flights found for your search criteria'
      }
    }
  } catch (err) {
    error.value = 'Failed to fetch flights'
    apiErrorDetails.value = err.message
    console.error('Error fetching flights:', err)
  } finally {
    loading.value = false
  }
})

function handleModifiedSearch(searchData) {
  console.log('Modified search submitted:', searchData);
  
  // Save updated search parameters to localStorage
  // No need to manually update localStorage since the BookingSection component already does that
  
  // Format parameters for the API
  const apiParams = {
    departureCode: searchData.from,
    destinationCode: searchData.to,
    departureDate: searchData.departDate,
    returnDate: searchData.returnDate || null,
    cabinClass: searchData.cabin,
    passengers: {
      adults: parseInt(searchData.adults) || 1,
      children: parseInt(searchData.children) || 0,
      infants: parseInt(searchData.infants) || 0
    }
  };
  
  // Update searchParams in our component state
  searchParams.value = searchData;
  
  // Reset results and start new search
  loading.value = true;
  error.value = null;
  apiErrorDetails.value = null;
  flights.value = [];
  
  // Perform the search with new parameters
  searchFlights(apiParams)
    .then(results => {
      if (results.error) {
        error.value = 'Error retrieving flight information';
        apiErrorDetails.value = results.error;
      } else {
        flights.value = results.flights;
        if (flights.value.length === 0) {
          error.value = 'No flights found for your search criteria';
        }
      }
    })
    .catch(err => {
      error.value = 'Failed to fetch flights';
      apiErrorDetails.value = err.message;
      console.error('Error fetching flights:', err);
    })
    .finally(() => {
      loading.value = false;
    });
}

function selectFlight(flight) {
  // TODO: Navigate to booking page with selected flight
  console.log('Selected flight:', flight)
}

// Format date for display (convert from YYYY-MM-DD to DD/MM/YYYY)
const formatDate = (dateString) => {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

// Translate cabin class code to readable label
const getCabinClassLabel = (classCode) => {
  const cabinClasses = {
    'E': 'Economy',
    'P': 'Premium Economy',
    'B': 'Business',
    'F': 'First Class'
  }
  return cabinClasses[classCode] || 'Economy'
}

// Get airline name from code
const getAirlineName = (code) => {
  const airlines = {
    'WY': 'Oman Air',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'EY': 'Etihad Airways',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'SQ': 'Singapore Airlines',
    'TK': 'Turkish Airlines',
    'AF': 'Air France',
    'KL': 'KLM Royal Dutch Airlines',
    'MS': 'EgyptAir',
    'GF': 'Gulf Air',
    'SV': 'Saudia',
    'ET': 'Ethiopian Airlines',
    'AI': 'Air India',
    'ME': 'Middle East Airlines',
    'RJ': 'Royal Jordanian'
  }
  
  return airlines[code] || `${code} Airlines`
};

// Format duration in minutes to hours and minutes
const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  
  return `${hours}h ${mins}m`;
};

function retrySearch() {
  // Retry the search with the same parameters
  loading.value = true;
  error.value = null;
  apiErrorDetails.value = null;
  searchFlights({
    from: searchParams.value.fromCode || searchParams.value.from,
    to: searchParams.value.toCode || searchParams.value.to,
    departureDate: searchParams.value.departDate,
    returnDate: searchParams.value.returnDate,
    cabinClass: searchParams.value.cabinClass,
    passengers: searchParams.value.passengers || [{ type: 'adult', count: 1 }]
  }).catch(err => console.error('Retry failed:', err))
}

// Create a computed property for transformed search parameters
const transformSearchParams = computed(() => {
  // Get the latest search params directly from localStorage to ensure consistency
  const storedParams = localStorage.getItem('flightSearchParams');
  const params = storedParams ? JSON.parse(storedParams) : searchParams.value;
  
  console.log('Current search params for BookingSection:', params);
  
  // Create properly formatted search params for BookingSection
  const formattedParams = {
    // Format locations as objects with the properties BookingSection expects
    from: { 
      mainLine: params.fromName || params.from || '',
      subLine: params.fromSubLine || '',
      iataCode: params.from || ''
    },
    to: {
      mainLine: params.toName || params.to || '',
      subLine: params.toSubLine || '',
      iataCode: params.to || ''
    },
    // Always use explicit tripType from localStorage if available
    tripType: params.tripType || (params.returnDate ? 'return' : 'oneWay'),
    
    // Format dates properly for BookingSection
    dates: params.returnDate ? 
      [new Date(params.departDate), new Date(params.returnDate)] : 
      new Date(params.departDate),
    
    // Set passenger counts
    passengers: {
      adults: parseInt(params.adults) || 1,
      children: parseInt(params.children) || 0,
      infants: parseInt(params.infants) || 0
    },
    
    // Use cabinClass directly if available, otherwise map from cabin code
    cabinClass: params.cabinClass || mapCabinClass(params.cabin)
  };
  
  console.log('Transformed params for BookingSection:', formattedParams);
  return formattedParams;
});

// Helper function to convert cabin class code to display name
function mapCabinClass(cabinCode) {
  const cabinMap = {
    'E': 'Economy',
    'P': 'Premium Economy',
    'B': 'Business',
    'F': 'First'
  };
  
  return cabinMap[cabinCode] || 'Economy';
}


function convertSearchDataToApiParams(searchData) {
  // Convert from BookingSection format to API format
  return {
    from: searchData.from.iataCode,
    to: searchData.to.iataCode,
    departureDate: searchData.departDate,
    returnDate: searchData.tripType === 'return' ? searchData.returnDate : null,
    cabinClass: getCabinClassCode(searchData.cabinClass),
    passengers: {
      adults: parseInt(searchData.passengers.adults || 0),
      children: parseInt(searchData.passengers.children || 0),
      infants: parseInt(searchData.passengers.infants || 0)
    }
  };
}

function getCabinClassCode(cabinClass) {
  const classMap = {
    'Economy': 'E',
    'Premium Economy': 'P',
    'Business': 'B',
    'First': 'F'
  };
  return classMap[cabinClass] || 'E';
}
</script>
