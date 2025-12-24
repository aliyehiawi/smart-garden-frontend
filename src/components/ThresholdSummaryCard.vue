<template>
  <div class="kpi-card" :class="`status-${rangeStatus}`">
    <div class="card-header">
      <div class="icon-wrapper">
        <span class="card-icon">📊</span>
      </div>
      <div class="card-title">Threshold Summary</div>
    </div>
    
    <div class="card-body">
      <div class="threshold-values">
        <div class="threshold-item">
          <span class="label">Min</span>
          <span class="value">{{ min }}%</span>
        </div>
        <div class="threshold-divider">—</div>
        <div class="threshold-item">
          <span class="label">Max</span>
          <span class="value">{{ max }}%</span>
        </div>
      </div>
      
      <div class="status-badge" :class="`badge-${rangeStatus}`">
        {{ rangeStatus === 'in-range' ? '✅ Within Range' : '⚠️ Out of Range' }}
      </div>
    </div>
    
    <div class="card-footer">
      <div class="range-bar">
        <div class="range-fill" :style="rangeStyle"></div>
        <div class="current-marker" :style="markerStyle">
          <span class="marker-dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  min: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    required: true
  }
})

const rangeStatus = computed(() => {
  if (props.currentValue >= props.min && props.currentValue <= props.max) {
    return 'in-range'
  }
  return 'out-range'
})

const rangeStyle = computed(() => {
  return {
    left: `${props.min}%`,
    width: `${props.max - props.min}%`
  }
})

const markerStyle = computed(() => {
  return {
    left: `${props.currentValue}%`
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

.status-in-range {
  border-color: #10B981;
}

.status-out-range {
  border-color: #F59E0B;
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

.threshold-values {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.threshold-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.threshold-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.threshold-item .value {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
}

.threshold-divider {
  font-size: 1.5rem;
  color: #D1D5DB;
  font-weight: 300;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  width: 100%;
}

.badge-in-range {
  background: #D1FAE5;
  color: #065F46;
}

.badge-out-range {
  background: #FEF3C7;
  color: #92400E;
}

.card-footer {
  margin-top: 1rem;
  position: relative;
}

.range-bar {
  height: 12px;
  background: #F3F4F6;
  border-radius: 6px;
  position: relative;
  overflow: visible;
}

.range-fill {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #10B981, #34D399);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.current-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: left 0.3s ease;
}

.marker-dot {
  display: block;
  width: 20px;
  height: 20px;
  background: #3B82F6;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: pulse-marker 2s ease-in-out infinite;
}

@keyframes pulse-marker {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>