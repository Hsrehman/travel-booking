<template>
  <div class="flight-segment">
    <!-- Date Header -->
    <div class="segment-date" v-if="showDate">
      <span class="date-dot">•</span>
      <span class="date-text">{{ formatSegmentDate(segment.departureTime) }}</span>
      <span v-if="segment.dayChange" class="day-change">+{{ segment.dayChange }}D</span>
    </div>

    <!-- Flight Info -->
    <div class="segment-content">
      <div class="departure">
        <div class="time">{{ formatTime(segment.departureTime) }}</div>
        <div class="airport">{{ segment.origin }}</div>
      </div>

      <div class="flight-path">
        <div class="flight-details">
          <span class="flight-number">
            <span class="airline-icon">{{ getAirlineCode(segment.flightNumber) }}</span>
            {{ segment.flightNumber }}
          </span>
          <span class="duration">{{ formatDuration(segment.duration) }}</span>
          <span class="cabin-class">{{ segment.cabinClass || 'Economy' }}</span>
        </div>
        <div class="flight-line">
          <div class="plane-icon"></div>
        </div>
      </div>

      <div class="arrival">
        <div class="time">{{ formatTime(segment.arrivalTime) }}</div>
        <div class="airport">{{ segment.destination }}</div>
      </div>
    </div>

    <!-- Layover Info -->
    <div v-if="segment.layover" class="layover">
      <div class="layover-icon"></div>
      <div class="layover-text">
        {{ formatDuration(segment.layover.duration) }} Layover in {{ segment.layover.airport }}
      </div>
    </div>

    <!-- Debug Baggage Data -->
    <div v-if="segment.baggageAllowance" style="display: none;">
      {{ console.log('Baggage Allowance:', segment.baggageAllowance) }}
    </div>
    
    <!-- Baggage Info -->
    <div v-if="segment.baggageAllowance" class="baggage-section">
      <div class="baggage-header" @click="isBaggageExpanded = !isBaggageExpanded">
        <span class="baggage-icon">🧳</span>
        <span class="baggage-title">Baggage Allowance</span>
        <span class="expand-icon" :class="{ 'expanded': isBaggageExpanded }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
      <transition name="baggage-slide">
        <div v-if="isBaggageExpanded" class="baggage-details">
          <!-- Direct baggage allowance (simple format) -->
          <div v-if="!segment.baggageAllowance.cabin && !segment.baggageAllowance.checked" class="baggage-item">
            <span class="baggage-type">🧳 Baggage</span>
            <span class="baggage-allowance">{{ formatBaggageAllowance(segment.baggageAllowance) }}</span>
          </div>
          
          <!-- Detailed baggage allowance (nested format) -->
          <template v-else>
            <div v-if="segment.baggageAllowance.cabin" class="baggage-item">
              <span class="baggage-type">🎒 Cabin</span>
              <span class="baggage-allowance">{{ formatBaggageAllowance(segment.baggageAllowance.cabin) }}</span>
            </div>
            <div v-if="segment.baggageAllowance.checked" class="baggage-item">
              <span class="baggage-type">🧳 Checked</span>
              <span class="baggage-allowance">{{ formatBaggageAllowance(segment.baggageAllowance.checked) }}</span>
            </div>
            <div v-if="segment.baggageAllowance.additional" class="baggage-item">
              <span class="baggage-type">🏷️ Additional</span>
              <span class="baggage-allowance">{{ formatBaggageAllowance(segment.baggageAllowance.additional) }}</span>
            </div>
          </template>
          
          <div class="baggage-note">
            <small>* Excess baggage fees may apply</small>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  segment: {
    type: Object,
    required: true
  },
  showDate: {
    type: Boolean,
    default: true
  }
});

const formatTime = (dateTime) => {
  return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatSegmentDate = (dateTime) => {
  const date = new Date(dateTime);
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options).toUpperCase();
};

const isBaggageExpanded = ref(false);

const getAirlineCode = (flightNumber) => {
  // Extract airline code from flight number (first 2 characters)
  return flightNumber ? flightNumber.substring(0, 2) : '--';
};

const formatBaggageAllowance = (baggage) => {
  if (!baggage) return 'Contact airline';
  
  // Handle string format
  if (typeof baggage === 'string') return baggage;
  
  // Handle object with type and value
  if (baggage.type && baggage.value !== undefined) {
    // Handle type="number" - indicates number of bags
    if (baggage.type === 'number') {
      const bagCount = parseInt(baggage.value, 10);
      return `${bagCount} ${bagCount === 1 ? 'bag' : 'bags'}`;
    }
    
    // Handle type="weight" - indicates weight with units
    if (baggage.type === 'weight') {
      const weight = baggage.value;
      const units = baggage.units || 'kg';
      return `${weight} ${units}`;
    }
    
    // Handle other types (cabin, checked, etc.)
    const typeMap = {
      'cabin': '🎒 Cabin',
      'checked': '🧳 Checked',
      'additional': '🏷️ Additional',
      'default': 'Baggage'
    };
    
    const typeLabel = typeMap[baggage.type] || baggage.type;
    const value = baggage.value || '';
    const units = baggage.units ? ` ${baggage.units}` : '';
    
    return `${value}${units}`.trim();
  }
  
  // Handle simple object with just value and units
  if (baggage.value !== undefined && baggage.units) {
    return `${baggage.value} ${baggage.units}`.trim();
  }
  
  // Fallback for any other format
  return 'Contact airline';
};
</script>

<style scoped>
.flight-segment {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.segment-date {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  font-size: 13px;
  color: #4a5568;
  position: relative;
}

.date-dot {
  color: #667eea;
  margin-right: 8px;
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
}

.day-change {
  margin-left: auto;
  background: #667eea;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
}

.segment-content {
  display: flex;
  padding: 16px;
  align-items: center;
}

.departure,
.arrival {
  min-width: 64px;
  text-align: center;
}

.time {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.airport {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  letter-spacing: 0.5px;
}

.flight-path {
  flex: 1;
  margin: 0 16px;
  position: relative;
  padding: 8px 0;
}

.flight-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #718096;
}

.flight-number {
  display: flex;
  align-items: center;
  gap: 4px;
}

.airline-icon {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.duration {
  font-weight: 500;
  color: #4a5568;
}

.cabin-class {
  background: #edf2f7;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: capitalize;
}

.flight-line {
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  position: relative;
  border-radius: 2px;
}

.plane-icon {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #667eea;
  clip-path: polygon(0 50%, 40% 0, 100% 50%, 40% 100%);
  animation: fly 2s ease-in-out infinite alternate;
}

.layover, .baggage-section {
  background: #fffaf0;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #feebc8;
}

.baggage-section {
  background: #f8f9fa;
  border-top: 1px solid #edf2f7;
  padding: 0;
  cursor: pointer;
}

.baggage-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
}

.baggage-icon {
  font-size: 16px;
}

.baggage-title {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  flex-grow: 1;
}

.expand-icon {
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.baggage-details {
  padding: 0 16px 12px 16px;
  border-top: 1px solid #edf2f7;
  margin-top: -4px;
  padding-top: 12px;
}

.baggage-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.baggage-type {
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 6px;
}

.baggage-allowance {
  color: #2d3748;
  font-weight: 500;
}

.baggage-note {
  margin-top: 8px;
  font-size: 11px;
  color: #a0aec0;
  text-align: right;
}

.baggage-slide-enter-active,
.baggage-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.baggage-slide-enter-from,
.baggage-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.layover-icon {
  width: 16px;
  height: 16px;
  border: 2px solid #f6ad55;
  border-radius: 50%;
  position: relative;
}

.layover-icon::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: #f6ad55;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.layover-text {
  font-size: 13px;
  color: #b7791f;
  font-weight: 500;
}

@keyframes fly {
  from { transform: translateY(-50%) translateX(0); }
  to { transform: translateY(-50%) translateX(4px); }
}

/* Responsive styles */
@media (max-width: 480px) {
  .segment-content {
    padding: 12px;
  }
  
  .time {
    font-size: 16px;
  }
  
  .airport {
    font-size: 13px;
  }
  
  .flight-details {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    margin-left: 8px;
  }
  
  .flight-path {
    margin: 0 8px;
  }
}
</style>
