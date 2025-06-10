<template>
  <div class="flight-segments">
    <div 
      v-for="(segment, index) in processedSegments" 
      :key="index"
      class="segment-wrapper"
    >
      <FlightSegment 
        :segment="segment" 
        :show-date="shouldShowDate(segment, index)" 
      />
    </div>
    
    <!-- Total Journey Time -->
    <div v-if="totalDuration" class="total-journey">
      <span class="total-label">Total Journey:</span>
      <span class="total-duration">{{ formatDuration(totalDuration) }}</span>
      <span class="status-badge">
        <span class="status-dot"></span>
        <span class="status-text">Confirmed</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import FlightSegment from './FlightSegment.vue';

const props = defineProps({
  segments: {
    type: Array,
    required: true,
    validator: (segments) => {
      return segments.every(segment => 
        segment.departureTime && 
        segment.arrivalTime &&
        segment.origin && 
        segment.destination &&
        segment.flightNumber
      );
    }
  },
  showTotal: {
    type: Boolean,
    default: true
  }
});

// Process segments to add layover information
const processedSegments = computed(() => {
  return props.segments.map((segment, index, array) => {
    const processedSegment = { ...segment };
    
    // Calculate day change
    const departureDate = new Date(segment.departureTime);
    const arrivalDate = new Date(segment.arrivalTime);
    const dayChange = Math.floor((arrivalDate - departureDate) / (1000 * 60 * 60 * 24));
    
    if (dayChange > 0) {
      processedSegment.dayChange = dayChange;
    }
    
    // Add layover information if not the last segment
    if (index < array.length - 1) {
      const nextSegment = array[index + 1];
      const layoverMinutes = Math.floor(
        (new Date(nextSegment.departureTime) - new Date(segment.arrivalTime)) / (1000 * 60)
      );
      
      if (layoverMinutes > 0) {
        processedSegment.layover = {
          duration: layoverMinutes,
          airport: segment.destination
        };
      }
    }
    
    return processedSegment;
  });
});

// Calculate total journey duration in minutes
const totalDuration = computed(() => {
  if (props.segments.length === 0) return 0;
  
  const firstDeparture = new Date(props.segments[0].departureTime);
  const lastArrival = new Date(props.segments[props.segments.length - 1].arrivalTime);
  
  return Math.floor((lastArrival - firstDeparture) / (1000 * 60));
});

// Format duration as "Xh Ym"
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Helper to determine if we should show the date for a segment
const shouldShowDate = (segment, index) => {
  if (index === 0) return true;
  
  const prevSegment = processedSegments.value[index - 1];
  const prevDate = new Date(prevSegment.departureTime).toDateString();
  const currentDate = new Date(segment.departureTime).toDateString();
  
  return prevDate !== currentDate;
};
</script>

<style scoped>
.flight-segments {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.segment-wrapper {
  border-bottom: 1px solid #f0f2f5;
}

.segment-wrapper:last-child {
  border-bottom: none;
}

.total-journey {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background-color: #f8f9fa;
  border-top: 1px solid #f0f2f5;
  font-size: 14px;
  color: #4a5568;
}

.total-label {
  margin-right: 8px;
  font-weight: 500;
}

.total-duration {
  font-weight: 600;
  color: #2d3748;
  margin-right: auto;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  color: #166534;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* Responsive styles */
@media (max-width: 480px) {
  .total-journey {
    padding: 12px;
    font-size: 13px;
  }
  
  .status-badge {
    padding: 3px 8px;
  }
}
</style>
