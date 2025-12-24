<template>
  <div class="live-sensor-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Live Sensor Data</h3>
        <div class="live-indicator" :class="{ active: isLive }">
          <span class="pulse-dot"></span>
          <span class="text">{{ isLive ? 'LIVE' : 'OFFLINE' }}</span>
        </div>
      </div>
      
      <!-- Device Selector -->
      <div v-if="devices.length > 1" class="device-selector">
        <select v-model="selectedDevice" @change="$emit('device-changed', selectedDevice)">
          <option v-for="device in devices" :key="device.id" :value="device.id">
            {{ device.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="card-body">
      <div class="sensor-grid">
        <!-- Water Level -->
        <div class="sensor-item primary">
          <div class="sensor-icon">💧</div>
          <div class="sensor-details">
            <span class="sensor-label">Water Level</span>
            <span class="sensor-value">{{ waterLevel }}%</span>
          </div>
          <div class="sensor-trend" :class="trendClass">
            <span class="trend-icon">{{ trendIcon }}</span>
            <span class="trend-text">{{ trendText }}</span>
          </div>
        </div>
      </div>

      <!-- Last Update -->
      <div class="last-update">
        <span class="icon">🕐</span>
        <span class="text">Last update: {{ lastUpdate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  waterLevel: {
    type: Number,
    required: true
  },
  lastUpdate: {
    type: String,
    required: true
  },
  isLive: {
    type: Boolean,
    default: true
  },
  devices: {
    type: Array,
    default: () => []
  },
  previousValue: {
    type: Number,
    default: null
  }
})

const selectedDevice = ref(props.devices[0]?.id || null)

const trendClass = computed(() => {
  if (props.previousValue === null) return 'neutral'
  const diff = props.waterLevel - props.previousValue
  if (diff > 0) return 'up'
  if (diff < 0) return 'down'
  return 'neutral'
})

const trendIcon = computed(() => {
  const trend = trendClass.value
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
})

const trendText = computed(() => {
  if (props.previousValue === null) return 'No change'
  const diff = Math.abs(props.waterLevel - props.previousValue)
  if (diff === 0) return 'No change'
  return `${diff.toFixed(1)}%`
})

defineEmits(['device-changed'])
</script>

<style scoped>
.live-sensor-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #10B981;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.live-sensor-card:hover {
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
  transform: translateY(-4px);
  border-color: #059669;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  background: #F3F4F6;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
}

.live-indicator.active {
  background: #D1FAE5;
  color: #065F46;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9CA3AF;
}

.live-indicator.active .pulse-dot {
  background: #10B981;
  animation: pulse-live 2s ease-in-out infinite;
}

@keyframes pulse-live {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

.device-selector select {
  padding: 0.5rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
}

.device-selector select:hover {
  border-color: #10B981;
}

.device-selector select:focus {
  outline: none;
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

.sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.sensor-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 12px;
  border: 2px solid #E5E7EB;
  transition: all 0.3s ease;
}

.sensor-item:hover {
  border-color: #10B981;
  background: #F0FDF4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.sensor-item.primary {
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  border-color: #3B82F6;
}

.sensor-item.primary:hover {
  border-color: #2563EB;
  background: linear-gradient(135deg, #BFDBFE, #93C5FD);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.sensor-icon {
  font-size: 1.8rem;
  line-height: 1;
}

.sensor-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.sensor-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sensor-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
}

.sensor-trend {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 8px;
}

.sensor-trend.up {
  background: #D1FAE5;
  color: #065F46;
}

.sensor-trend.down {
  background: #FEE2E2;
  color: #991B1B;
}

.sensor-trend.neutral {
  background: #F3F4F6;
  color: #6B7280;
}

.trend-icon {
  font-size: 1.25rem;
  font-weight: 700;
}

.trend-text {
  font-size: 0.75rem;
  font-weight: 600;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f7f8f9;
;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #474c55;
  font-weight: 500;
  margin-top: auto;
  flex-shrink: 0;
}

.last-update .icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .sensor-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .device-selector select {
    width: 100%;
    min-width: auto;
  }
  
  .live-sensor-card {
    min-height: auto;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .sensor-grid {
    grid-template-columns: 1fr;
  }
  
  .device-selector select {
    min-width: 140px;
  }
}
</style>