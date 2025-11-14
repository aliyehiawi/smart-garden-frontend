<template>
  <div class="chart-card">
    <div class="chart-header">
      <span class="chart-icon">{{ icon }}</span>
      <h3>{{ title }}</h3>
    </div>

    <div class="chart-container" ref="chartContainer">
      <svg :width="chartWidth" :height="chartHeight" class="chart-svg">
        <!-- Grid lines -->
        <g class="grid">
          <line
            v-for="i in 5"
            :key="`grid-${i}`"
            :x1="padding"
            :y1="padding + ((chartHeight - padding * 2) / 4) * (i - 1)"
            :x2="chartWidth - padding"
            :y2="padding + ((chartHeight - padding * 2) / 4) * (i - 1)"
            stroke="#e0e0e0"
            stroke-width="1"
          />
        </g>

        <!-- Y-axis labels -->
        <g class="y-labels">
          <text
            v-for="(label, i) in yAxisLabels"
            :key="`y-label-${i}`"
            :x="padding - 10"
            :y="padding + ((chartHeight - padding * 2) / 4) * i + 5"
            text-anchor="end"
            font-size="12"
            fill="#999"
          >
            {{ label }}
          </text>
        </g>

        <!-- Line path -->
        <path
          v-if="pathData"
          :d="pathData"
          :stroke="color"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Area under line -->
        <path
          v-if="areaData"
          :d="areaData"
          :fill="color"
          opacity="0.1"
        />

        <!-- Data points -->
        <g class="data-points">
          <circle
            v-for="(point, i) in dataPoints"
            :key="`point-${i}`"
            :cx="point.x"
            :cy="point.y"
            r="4"
            :fill="color"
            class="data-point"
            @mouseenter="showTooltip(point, $event)"
            @mouseleave="hideTooltip"
          />
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        class="tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="tooltip-time">{{ tooltip.time }}</div>
        <div class="tooltip-value">{{ tooltip.value }} {{ unit }}</div>
      </div>
    </div>

    <div class="chart-stats">
      <div class="stat">
        <span class="stat-label">Min:</span>
        <span class="stat-value">{{ minValue }} {{ unit }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Max:</span>
        <span class="stat-value">{{ maxValue }} {{ unit }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Avg:</span>
        <span class="stat-value">{{ avgValue }} {{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: String,
  data: Array,
  color: String,
  unit: String,
  icon: String,
})

const chartContainer = ref(null)
const chartWidth = ref(400)
const chartHeight = ref(250)
const padding = 40

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  time: '',
  value: '',
})

// Calculate chart dimensions on mount and resize
onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
})

function updateDimensions() {
  if (chartContainer.value) {
    chartWidth.value = chartContainer.value.offsetWidth
  }
}

// Calculate min, max, avg values
const minValue = computed(() => {
  if (props.data.length === 0) return '0'
  return Math.min(...props.data.map((d) => d.value)).toFixed(1)
})

const maxValue = computed(() => {
  if (props.data.length === 0) return '0'
  return Math.max(...props.data.map((d) => d.value)).toFixed(1)
})

const avgValue = computed(() => {
  if (props.data.length === 0) return '0'
  const sum = props.data.reduce((acc, d) => acc + d.value, 0)
  return (sum / props.data.length).toFixed(1)
})

// Y-axis labels
const yAxisLabels = computed(() => {
  if (props.data.length === 0) return ['0', '0', '0', '0', '0']
  
  const max = parseFloat(maxValue.value)
  const min = parseFloat(minValue.value)
  const step = (max - min) / 4
  
  return [
    max.toFixed(0),
    (max - step).toFixed(0),
    (max - step * 2).toFixed(0),
    (max - step * 3).toFixed(0),
    min.toFixed(0),
  ]
})

// Calculate data points for plotting
const dataPoints = computed(() => {
  if (props.data.length === 0) return []

  const maxY = parseFloat(maxValue.value)
  const minY = parseFloat(minValue.value)
  const rangeY = maxY - minY || 1

  const plotWidth = chartWidth.value - padding * 2
  const plotHeight = chartHeight.value - padding * 2

  return props.data.map((point, index) => {
    const x = padding + (index / (props.data.length - 1 || 1)) * plotWidth
    const normalizedValue = (point.value - minY) / rangeY
    const y = chartHeight.value - padding - normalizedValue * plotHeight

    return {
      x,
      y,
      value: point.value,
      timestamp: point.timestamp,
    }
  })
})

// Create SVG path for line
const pathData = computed(() => {
  if (dataPoints.value.length === 0) return ''

  let path = `M ${dataPoints.value[0].x} ${dataPoints.value[0].y}`
  
  for (let i = 1; i < dataPoints.value.length; i++) {
    path += ` L ${dataPoints.value[i].x} ${dataPoints.value[i].y}`
  }

  return path
})

// Create SVG path for area under line
const areaData = computed(() => {
  if (dataPoints.value.length === 0) return ''

  let path = `M ${dataPoints.value[0].x} ${chartHeight.value - padding}`
  path += ` L ${dataPoints.value[0].x} ${dataPoints.value[0].y}`
  
  for (let i = 1; i < dataPoints.value.length; i++) {
    path += ` L ${dataPoints.value[i].x} ${dataPoints.value[i].y}`
  }

  const lastPoint = dataPoints.value[dataPoints.value.length - 1]
  path += ` L ${lastPoint.x} ${chartHeight.value - padding} Z`

  return path
})

function showTooltip(point, event) {
  const rect = chartContainer.value.getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: point.x,
    y: point.y - 40,
    time: formatTime(point.timestamp),
    value: point.value.toFixed(1),
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.chart-icon {
  font-size: 1.5rem;
}

.chart-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.chart-container {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.chart-svg {
  display: block;
}

.data-point {
  cursor: pointer;
  transition: r 0.2s;
}

.data-point:hover {
  r: 6;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 5px;
  font-size: 0.875rem;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  transform: translateX(-50%);
}

.tooltip-time {
  font-size: 0.75rem;
  opacity: 0.8;
}

.tooltip-value {
  font-weight: bold;
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
}
</style>