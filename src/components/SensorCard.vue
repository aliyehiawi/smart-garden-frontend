<template>
  <div class="sensor-card">
    <div class="sensor-header">
      <span class="sensor-icon">{{ icon }}</span>
      <h3>{{ title }}</h3>
    </div>
    
    <div class="sensor-value">
      {{ value }} <span class="unit">{{ unit }}</span>
    </div>
    
    <div class="sensor-status" :class="statusClass">
      {{ statusText }}
    </div>
    
    <div class="sensor-range">
      <small>Range: {{ min }} - {{ max }} {{ unit }}</small>
    </div>
    
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: progressPercentage + '%' }"
        :class="statusClass"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [Number, String],
  unit: String,
  icon: String,
  min: Number,
  max: Number,
})

const numericValue = computed(() => parseFloat(props.value))

const statusClass = computed(() => {
  if (numericValue.value < props.min) return 'status-low'
  if (numericValue.value > props.max) return 'status-high'
  return 'status-normal'
})

const statusText = computed(() => {
  if (numericValue.value < props.min) return '⚠️ Below threshold'
  if (numericValue.value > props.max) return '⚠️ Above threshold'
  return '✓ Normal'
})

const progressPercentage = computed(() => {
  const range = props.max - props.min
  const valueInRange = Math.max(props.min, Math.min(props.max, numericValue.value))
  return ((valueInRange - props.min) / range) * 100
})
</script>

<style scoped>
.sensor-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.sensor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sensor-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sensor-icon {
  font-size: 2rem;
}

.sensor-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  margin: 0;
}

.sensor-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.unit {
  font-size: 1.25rem;
  font-weight: normal;
  color: #999;
}

.sensor-status {
  padding: 0.5rem;
  border-radius: 5px;
  text-align: center;
  font-weight: 500;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.status-normal {
  background: #d4edda;
  color: #155724;
}

.status-low,
.status-high {
  background: #fff3cd;
  color: #856404;
}

.sensor-range {
  text-align: center;
  color: #999;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 10px;
}

.progress-fill.status-normal {
  background: linear-gradient(90deg, #48bb78, #38a169);
}

.progress-fill.status-low {
  background: linear-gradient(90deg, #ed8936, #dd6b20);
}

.progress-fill.status-high {
  background: linear-gradient(90deg, #f56565, #e53e3e);
}
</style>