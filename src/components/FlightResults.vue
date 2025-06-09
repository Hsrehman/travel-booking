<template>
  <div class="flight-results">
    <!-- Filters and Sort -->
    <div class="controls">
      <div class="sort-options">
        <label>Sort by:</label>
        <select v-model="sortBy" class="sort-select">
          <option value="price">Price (Low to High)</option>
          <option value="-price">Price (High to Low)</option>
          <option value="duration">Duration (Shortest)</option>
          <option value="departure">Departure (Earliest)</option>
        </select>
      </div>
      
      <button class="filter-toggle" @click="showFilters = !showFilters">
        {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
      </button>
    </div>

    <div class="content">
      <!-- Filters Panel -->
      <transition name="slide">
        <aside v-show="showFilters" class="filters-panel">
          <h3>Filters</h3>
          
          <!-- Price Range -->
          <div class="filter-section">
            <h4>Price Range</h4>
            <div class="price-range">
              <input 
                type="range" 
                v-model="filters.maxPrice" 
                :min="minPrice" 
                :max="maxPrice"
                step="10"
              />
              <div class="price-labels">
                <span>${{ minPrice }}</span>
                <span>${{ filters.maxPrice }}</span>
              </div>
            </div>
          </div>

          <!-- Airlines -->
          <div class="filter-section" v-if="availableAirlines.length">
            <h4>Airlines</h4>
            <div class="airline-list">
              <label 
                v-for="airline in availableAirlines" 
                :key="airline.code"
                class="checkbox-label"
              >
                <input 
                  type="checkbox" 
                  v-model="filters.airlines"
                  :value="airline.code"
                />
                <span>{{ airline.name }} ({{ airline.count }})</span>
              </label>
            </div>
          </div>

          <!-- Stops -->
          <div class="filter-section">
            <h4>Stops</h4>
            <div class="stops-options">
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="filters.stops"
                  :value="null"
                />
                <span>Any</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="filters.stops"
                  :value="0"
                />
                <span>Non-stop only</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="filters.stops"
                  :value="1"
                />
                <span>1 stop max</span>
              </label>
            </div>
          </div>

          <!-- Time of Day -->
          <div class="filter-section">
            <h4>Departure Time</h4>
            <div class="time-slots">
              <button 
                v-for="slot in timeSlots"
                :key="slot.value"
                :class="['time-slot', { active: filters.departureTime === slot.value }]"
                @click="filters.departureTime = slot.value"
              >
                {{ slot.label }}
              </button>
            </div>
          </div>
        </aside>
      </transition>

      <!-- Results List -->
      <div class="results-list">
        <div v-if="!filteredFlights.length" class="no-results">
          <p>No flights match your current filters.</p>
          <button @click="resetFilters" class="reset-btn">Reset Filters</button>
        </div>

        <div v-else class="flight-cards">
          <div 
            v-for="flight in sortedFlights" 
            :key="flight.id" 
            class="flight-card"
            :class="{ 'expanded': expandedFlightId === flight.id }"
          >
            <!-- Price in top right corner -->
            <div class="flight-price-corner">
              <span class="amount">${{ flight.price }}</span>
              <span class="price-label">per person</span>
            </div>
            
            <!-- Airline Info -->
            <div class="airline-info">
              <img 
                :src="getAirlineLogo(flight.airlineCode)" 
                :alt="flight.airlineName"
                class="airline-logo"
              />
              <div class="airline-details">
                <span class="airline-name">{{ flight.airlineName }}</span>
                <span class="flight-number">{{ flight.airlineCode }} {{ flight.flightNumber }}</span>
              </div>
            </div>

            <!-- Flight Route -->
            <div class="flight-route">
              <div class="departure">
                <time class="time">{{ formatTime(flight.departureTime) }}</time>
                <div class="airport">{{ flight.departureAirport }}</div>
              </div>

              <div class="route-info">
                <div class="duration">{{ formatDuration(flight.duration) }}</div>
                <div 
                  class="route-line"
                  @click="flight.stops > 0 && toggleFlightDetails(flight.id)"
                  :class="{ 'clickable': flight.stops > 0 }"
                >
                  <span 
                    class="stops-indicator"
                    :class="{ 'non-stop': flight.stops === 0 }"
                    @click.stop="flight.stops > 0 && toggleFlightDetails(flight.id)"
                  >
                    {{ flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}` }}
                  </span>
                </div>
              </div>

              <div class="arrival">
                <time class="time">{{ formatTime(flight.arrivalTime) }}</time>
                <div class="airport">{{ flight.arrivalAirport }}</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flight-actions">
              <div class="action-buttons">
                <button 
                  class="view-details-btn"
                  @click="toggleFlightDetails(flight.id)"
                >
                  {{ expandedFlightId === flight.id ? 'Hide Details' : 'View Details' }}
                </button>
                <button 
                  class="select-btn"
                  @click="selectFlight(flight)"
                >
                  Select
                </button>
              </div>
            </div>

            <!-- Expanded Flight Segments -->
            <transition name="expand">
              <div v-if="expandedFlightId === flight.id" class="flight-segments">
                <div class="segment-divider">
                  <span>Flight Segments</span>
                </div>
                
                <!-- Group segments by date -->
                <template v-if="flight.segments && flight.segments.length > 0">
                  <template v-for="(segment, index) in flight.segments" :key="index">
                    <!-- Date heading -->
                    <div v-if="index === 0 || new Date(segment.departureTime).toDateString() !== new Date(flight.segments[index-1].departureTime).toDateString()" class="date-heading">
                      {{ formatDate(segment.departureTime) }}
                    </div>
                    
                    <!-- Segment Details -->
                    <div class="segment-card">
                      <div class="airline-row">
                        <div class="segment-airline">
                          <img 
                            :src="getAirlineLogo(segment.airline)" 
                            :alt="segment.airline"
                            class="segment-airline-logo"
                          />
                          <span class="segment-flight-number">{{ segment.airline }} {{ segment.flightNumber }}</span>
                        </div>
                        
                        <div class="segment-route">
                          <div class="segment-departure">
                            <div class="segment-time">{{ formatTime(segment.departureTime) }}</div>
                            <div class="segment-airport">{{ segment.from }}</div>
                          </div>
                          
                          <div class="segment-duration">
                            <div class="duration-label">{{ formatDuration(new Date(segment.arrivalTime) - new Date(segment.departureTime)) }}</div>
                            <div class="duration-line"></div>
                          </div>
                          
                          <div class="segment-arrival">
                            <div class="segment-time">
                              {{ formatTime(segment.arrivalTime) }}
                              <span v-if="new Date(segment.arrivalTime).getDate() > new Date(segment.departureTime).getDate()" class="next-day">+{{ new Date(segment.arrivalTime).getDate() - new Date(segment.departureTime).getDate() }}D</span>
                            </div>
                            <div class="segment-airport">{{ segment.to }}</div>
                          </div>
                        </div>
                        
                        <div class="segment-class">
                          <span class="label">Class:</span>
                          <span>{{ segment.class }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Layover information between segments -->
                    <div class="layover-container" v-if="index < flight.segments.length - 1">
                      <div class="layover-line"></div>
                      <div class="layover-badge">
                        {{ getLayoverDuration(segment.arrivalTime, flight.segments[index+1].departureTime) }} layover in {{ segment.to }}
                      </div>
                      <div class="layover-line"></div>
                    </div>

                  </template>
                </template>
                
                <!-- Fallback when no segments data is available -->
                <div v-else class="no-segments-fallback">
                  <div class="segment-card">
                    <div class="segment-fallback-content">
                      <div class="segment-airline">
                        <img 
                          :src="getAirlineLogo(flight.airlineCode)" 
                          :alt="flight.airlineName"
                          class="segment-airline-logo"
                        />
                        <span class="segment-flight-number">{{ flight.airlineCode }} {{ flight.flightNumber }}</span>
                      </div>
                      
                      <div class="segment-route">
                        <div class="segment-departure">
                          <div class="segment-time">{{ formatTime(flight.departureTime) }}</div>
                          <div class="segment-airport">{{ flight.departureAirport }}</div>
                        </div>
                        
                        <div class="segment-duration">
                          <div class="duration-label">{{ formatDuration(flight.duration) }}</div>
                          <div class="duration-line"></div>
                        </div>
                        
                        <div class="segment-arrival">
                          <div class="segment-time">{{ formatTime(flight.arrivalTime) }}</div>
                          <div class="segment-airport">{{ flight.arrivalAirport }}</div>
                        </div>
                      </div>
                      
                      <div class="segment-class">
                        <span class="label">{{ flight.stops === 1 ? '1 stop' : `${flight.stops} stops` }}</span>
                        <span>Flight details not available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  flights: {
    type: Array,
    required: true,
    default: () => []
  },
  searchParams: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['flight-selected']);

// State
const showFilters = ref(true);
const sortBy = ref('price');
const expandedFlightId = ref(null);
const filters = ref({
  maxPrice: Infinity,
  airlines: [],
  stops: null,
  departureTime: 'any'
});

// Time slot options
const timeSlots = [
  { value: 'any', label: 'Any Time' },
  { value: 'morning', label: 'Morning (6AM-12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM-6PM)' },
  { value: 'evening', label: 'Evening (After 6PM)' }
];

// Computed
const minPrice = computed(() => {
  if (!props.flights.length) return 0;
  return Math.min(...props.flights.map(f => f.price));
});

const maxPrice = computed(() => {
  if (!props.flights.length) return 1000;
  return Math.max(...props.flights.map(f => f.price));
});

const availableAirlines = computed(() => {
  const airlines = new Map();
  props.flights.forEach(flight => {
    const count = airlines.get(flight.airlineCode)?.count || 0;
    airlines.set(flight.airlineCode, {
      code: flight.airlineCode,
      name: flight.airlineName,
      count: count + 1
    });
  });
  return Array.from(airlines.values());
});

const filteredFlights = computed(() => {
  return props.flights.filter(flight => {
    // Price filter
    if (flight.price > filters.value.maxPrice) return false;
    
    // Airline filter
    if (filters.value.airlines.length && 
        !filters.value.airlines.includes(flight.airlineCode)) {
      return false;
    }
    
    // Stops filter
    if (filters.value.stops !== null && flight.stops !== filters.value.stops) {
      return false;
    }
    
    // Time filter
    if (filters.value.departureTime !== 'any') {
      const hour = new Date(flight.departureTime).getHours();
      switch (filters.value.departureTime) {
        case 'morning':
          if (hour < 6 || hour >= 12) return false;
          break;
        case 'afternoon':
          if (hour < 12 || hour >= 18) return false;
          break;
        case 'evening':
          if (hour < 18) return false;
          break;
      }
    }
    
    return true;
  });
});

const sortedFlights = computed(() => {
  const direction = sortBy.value.startsWith('-') ? -1 : 1;
  const field = sortBy.value.replace('-', '');
  
  return [...filteredFlights.value].sort((a, b) => {
    switch (field) {
      case 'price':
        return (a.price - b.price) * direction;
      case 'duration':
        return a.duration - b.duration;
      case 'departure':
        return new Date(a.departureTime) - new Date(b.departureTime);
      default:
        return 0;
    }
  });
});

// Methods
const formatTime = (timeValue) => {
  if (!timeValue) return 'N/A';
  
  // Handle time-only strings (HH:MM)
  if (typeof timeValue === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timeValue)) {
    const [hours, minutes] = timeValue.split(':').map(Number);
    
    // Return in 24-hour format
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // For full date strings (existing code path)
  let date;
  
  try {
    // Check if it's ISO format
    if (typeof timeValue === 'string' && timeValue.includes('T')) {
      date = new Date(timeValue);
    } 
    // Check if it's a timestamp
    else if (!isNaN(Number(timeValue))) {
      date = new Date(Number(timeValue));
    }
    // Handle date string without time
    else if (typeof timeValue === 'string' && timeValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = new Date(`${timeValue}T00:00:00`);
    }
    // Default case
    else {
      date = new Date(timeValue);
    }
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', timeValue);
      return 'N/A';
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (err) {
    console.error('Error formatting time:', err);
    return 'N/A';
  }
};

const formatDuration = (duration) => {
  // If duration is in milliseconds (common from Date operations)
  if (duration > 1000) {
    duration = Math.floor(duration / (1000 * 60)); // Convert ms to minutes
  }
  
  const hours = Math.floor(duration / 60);
  const mins = Math.floor(duration % 60);
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

const getAirlineLogo = (code) => {
  return `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;
};

const toggleFlightDetails = (flightId) => {
  expandedFlightId.value = expandedFlightId.value === flightId ? null : flightId;
};

const selectFlight = (flight) => {
  emit('flight-selected', flight);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'N/A';
  }
};

const getLayoverDuration = (arrivalTime, departureTime) => {
  const arrival = new Date(arrivalTime);
  const departure = new Date(departureTime);
  const diffMs = departure - arrival;
  const diffMinutes = Math.round(diffMs / 60000);
  return formatDuration(diffMinutes);
};

const resetFilters = () => {
  filters.value = {
    maxPrice: maxPrice.value,
    airlines: [],
    stops: null,
    departureTime: 'any'
  };
};

// Initialize maxPrice filter
if (props.flights.length) {
  filters.value.maxPrice = maxPrice.value;
}
</script>

<style scoped>
.flight-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-options label {
  font-weight: 500;
  color: #4b5563;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  min-width: 180px;
  color: #374151;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.sort-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.filter-toggle {
  padding: 8px 16px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #4b5563;
  transition: all 0.2s ease;
}

.filter-toggle:hover {
  background-color: #e5e7eb;
}

.content {
  display: flex;
  gap: 24px;
}

/* Filters Panel */
.filters-panel {
  width: 280px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: fit-content;
  border: 1px solid #f3f4f6;
}

.filters-panel h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.price-range {
  margin-top: 16px;
}

.price-range input[type="range"] {
  width: 100%;
  accent-color: #3b82f6;
}

.price-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}

.airline-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 6px;
}

.checkbox-label, .radio-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  color: #4b5563;
}

.checkbox-label input, .radio-label input {
  margin-right: 8px;
  accent-color: #3b82f6;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.time-slot {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  background-color: white;
  transition: all 0.2s;
}

.time-slot.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.time-slot:hover:not(.active) {
  background-color: #f9fafb;
}

/* Results List */
.results-list {
  flex: 1;
}

.no-results {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.reset-btn {
  margin-top: 16px;
  padding: 8px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background-color: #2563eb;
}

.flight-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flight-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.flight-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.flight-price-corner {
  position: absolute;
  top: 16px;
  right: 16px;
  text-align: right;
  line-height: 1.2;
}

.flight-price-corner .amount {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a237e;
}

.flight-price-corner .price-label {
  font-size: 0.75rem;
  color: #666;
  opacity: 0.9;
}

.airline-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.airline-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.airline-details {
  flex: 1;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
}

.airline-name {
  font-weight: 600;
  color: #111827;
}

.flight-number {
  font-size: 13px;
  color: #6b7280;
}

.flight-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.departure, .arrival {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
}

.time {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.airport {
  font-size: 14px;
  color: #4b5563;
  margin-top: 4px;
}

.route-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
}

.duration {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
}

.route-line {
  width: 100%;
  position: relative;
  height: 2px;
  background-color: #e5e7eb;
}

.route-line::before,
.route-line::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #3b82f6;
  top: 50%;
  transform: translateY(-50%);
}

.route-line::before {
  left: 0;
}

.route-line::after {
  right: 0;
}

.stops-indicator {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 0 8px;
  font-size: 12px;
  color: #6b7280;
}

.stops-indicator.non-stop {
  color: #059669;
  font-weight: 500;
}

.route-line.clickable,
.stops-indicator:not(.non-stop) {
  cursor: pointer;
}

.route-line.clickable:hover,
.stops-indicator:not(.non-stop):hover {
  opacity: 0.8;
}

.flight-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.price {
  display: none;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.view-details-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #1a73e8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.view-details-btn:hover {
  background-color: #f8f9fa;
  border-color: #c2e0ff;
}

.view-details-btn:active {
  background-color: #e8f0fe;
}

.select-btn {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  align-self: flex-end;
  cursor: pointer;
  transition: background-color 0.2s;
}

.select-btn:hover {
  background-color: #2563eb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
  
  .filters-panel {
    width: 100%;
  }
  
  .flight-route {
    flex-direction: column;
    gap: 16px;
  }
  
  .departure, .arrival {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .route-info {
    padding: 16px 0;
  }
}

/* Expanded Flight Segments */
.flight-segments {
  margin-top: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
}

.segment-divider {
  padding: 12px 16px;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 500;
  color: #4b5563;
  font-size: 14px;
}

.date-heading {
  padding: 6px 14px;
  background-color: #dbeafe;
  color: #1e40af;
  font-size: 13px;
  font-weight: 500;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  margin: 8px 0 8px 16px;
  position: relative;
  z-index: 1;
}

.segment-card {
  background-color: white;
  margin: 12px 16px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.airline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.segment-airline {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.segment-airline-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.segment-flight-number {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.segment-route {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.segment-departure, .segment-arrival {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.segment-time {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.segment-airport {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.segment-duration {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12px;
}

.duration-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.duration-line {
  width: 100px;
  height: 1px;
  background-color: #e5e7eb;
  position: relative;
}

.duration-line::before,
.duration-line::after {
  content: "";
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #e5e7eb;
  top: 50%;
  transform: translateY(-50%);
}

.duration-line::before {
  left: 0;
}

.duration-line::after {
  right: 0;
}

.segment-class {
  min-width: 100px;
  text-align: right;
  font-size: 13px;
}

.segment-fallback-content {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.no-segments-fallback {
  padding: 16px;
}

.next-day {
  font-size: 11px;
  color: #dc2626;
  margin-left: 2px;
  font-weight: 500;
}

.layover-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
  padding: 0 16px;
  position: relative;
}

.layover-line {
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
  margin: 0 12px;
}

.layover-badge {
  background-color: #fef3c7;
  color: #92400e;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  border: 1px solid #fcd34d;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.date-heading {
  margin: 16px 0 8px 16px;
  display: inline-block;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
  max-height: 1500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>