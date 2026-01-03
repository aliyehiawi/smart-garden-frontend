<template>
  <div class="kpi-card" :class="`status-${isRunning ? 'active' : 'inactive'}`">
    <div class="card-header">
      <div class="icon-wrapper" :class="{ rotating: isRunning }">
        <span class="card-icon">⚙️</span>
      </div>
      <div class="card-title">Pump Status</div>
    </div>
    
    <div class="card-body">
      <div class="main-value">{{ isRunning ? 'ON' : 'OFF' }}</div>
      <div class="status-row">
        <span class="status-badge" :class="`badge-${mode}`">
          {{ mode.toUpperCase() }}
        </span>
        <span v-if="isRunning && runningTime" class="running-time">
          🕐 {{ runningTime }}
        </span>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="pulse-indicator" :class="{ active: isRunning }">
        <span class="pulse-dot"></span>
        <span class="pulse-text">{{ isRunning ? 'Running' : 'Standby' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { watch } from 'vue'

watch(() => props.isRunning, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log('Pump status changed:', oldVal, '→', newVal)
    // Force re-render by updating a local reactive value
  }
}, { immediate: true })

watch(() => props.runningTime, (newVal) => {
  console.log('⏱️ Running time updated:', newVal)
}, { immediate: true })

const props = defineProps({
  isRunning: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    default: 'auto',
    validator: (val) => ['auto', 'manual'].includes(val)
  },
  runningTime: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.status-active {
  border-color: #10B981;
}

.status-inactive {
  border-color: #9CA3AF;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #E0E7FF, #C7D2FE);
  transition: transform 0.3s ease;
}

.icon-wrapper.rotating {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.card-icon {
  font-size: 1.5rem;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-body {
  margin-bottom: 1rem;
}

.main-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1F2937;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-auto {
  background: #D1FAE5;
  color: #065F46;
}

.badge-manual {
  background: #FEF3C7;
  color: #92400E;
}

.running-time {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

.card-footer {
  margin-top: 1rem;
}

.pulse-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #9CA3AF;
}

.pulse-indicator.active .pulse-dot {
  background: #10B981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.pulse-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
}

.pulse-indicator.active .pulse-text {
  color: #10B981;
}
</style>