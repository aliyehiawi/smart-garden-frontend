<template>
  <div class="kpi-card" :class="`status-${statusLevel}`">
    <div class="card-header">
      <div class="icon-wrapper">
        <span class="card-icon">💧</span>
      </div>
      <div class="card-title">Water Level</div>
    </div>

    <div class="card-body">
      <div class="main-value">{{ value }}cm</div>
      <div class="status-badge" :class="`badge-${statusLevel}`">
        {{ statusText }}
      </div>
    </div>

    <div class="card-footer">
      <div class="indicator-bar">
        <div class="indicator-fill" :style="{ width: `${value}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
  },
  max: {
    type: Number,
  },
})

const statusLevel = computed(() => {
  // Lower reading = more water (tank full) → HIGH status
  // Higher reading = less water (tank empty) → LOW status
  if (props.value < props.min) return 'high'
  if (props.value > props.max) return 'low'
  return 'normal'
})

const statusText = computed(() => {
  // Lower reading = more water (tank full) → HIGH
  // Higher reading = less water (tank empty) → LOW
  if (props.value < props.min) return 'HIGH'
  if (props.value > props.max) return 'LOW'
  return 'NORMAL'
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

.status-normal {
  border-color: #10b981;
}

.status-low {
  border-color: #ef4444;
}

.status-high {
  border-color: #10b981;
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
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.card-icon {
  font-size: 1.5rem;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-body {
  margin-bottom: 1rem;
}

.main-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.5rem;
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

.badge-normal {
  background: #dbeafe;
  color: #1e40af;
}

.badge-low {
  background: #fee2e2;
  color: #991b1b;
}

.badge-high {
  background: #d1fae5;
  color: #065f46;
}

.card-footer {
  margin-top: 1rem;
}

.indicator-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.indicator-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.status-low .indicator-fill {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.status-high .indicator-fill {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.status-high .indicator-fill {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
</style>
