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
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

const getAirlineCode = (flightNumber) => {
  // Extract airline code from flight number (first 2 characters)
  return flightNumber ? flightNumber.substring(0, 2) : '--';
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

.layover {
  background: #fffaf0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #feebc8;
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
