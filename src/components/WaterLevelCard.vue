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
    required: true
  },
  min: {
    type: Number,
  },
  max: {
    type: Number,
  }
})

const statusLevel = computed(() => {
  if (props.value < props.min) return 'low'
  if (props.value > props.max) return 'high'
  return 'normal'
})

const statusText = computed(() => {
  if (props.value < props.min) return 'Low'
  if (props.value > props.max) return 'High'
  return 'Normal'
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
  border-color: #10B981;
}

.status-low {
  border-color: #F59E0B;
}

.status-high {
  border-color: #EF4444;
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
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
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
  background: #D1FAE5;
  color: #065F46;
}

.badge-low {
  background: #FEF3C7;
  color: #92400E;
}

.badge-high {
  background: #FEE2E2;
  color: #991B1B;
}

.card-footer {
  margin-top: 1rem;
}

.indicator-bar {
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.indicator-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #34D399);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.status-low .indicator-fill {
  background: linear-gradient(90deg, #F59E0B, #FBBF24);
}

.status-high .indicator-fill {
  background: linear-gradient(90deg, #EF4444, #F87171);
}
</style>