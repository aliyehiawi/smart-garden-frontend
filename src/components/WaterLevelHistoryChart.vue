<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="title-section">
        <h3>Water Level History</h3>
        <p class="subtitle">Real-time monitoring and historical trends</p>
      </div>
      
      <div class="chart-controls">
        <!-- Date Range Filter -->
        <div class="filter-group">
          <label>Time Range:</label>
          <select v-model="selectedRange" @change="handleRangeChange">
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <!-- Device Filter -->
        <div v-if="devices.length > 1" class="filter-group">
          <label>Device:</label>
          <select v-model="selectedDevice" @change="handleDeviceChange">
            <option value="all">All Devices</option>
            <option v-for="device in devices" :key="device.id" :value="device.id">
              {{ device.name }}
            </option>
          </select>
        </div>

        <!-- Export Button -->
        <button @click="exportData" class="btn-export" title="Export to CSV">
          📥 Export
        </button>
      </div>
    </div>

    <!-- Custom Date Range (shown when 'custom' is selected) -->
    <div v-if="selectedRange === 'custom'" class="custom-range">
      <input v-model="customStartDate" type="datetime-local" />
      <span>to</span>
      <input v-model="customEndDate" type="datetime-local" />
      <button @click="applyCustomRange" class="btn-apply">Apply</button>
    </div>

    <!-- Chart Container -->
    <div class="chart-container" ref="chartContainer">
      <canvas ref="chartCanvas"></canvas>
      
      <!-- Loading State -->
      <div v-if="loading" class="chart-loading">
        <div class="spinner"></div>
        <p>Loading chart data...</p>
      </div>

      <!-- No Data State -->
      <div v-if="!loading && chartData.length === 0" class="chart-empty">
        <span class="icon">📊</span>
        <p>No data available for the selected range</p>
      </div>
    </div>

    <!-- Chart Legend -->
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color" style="background: #10B981;"></span>
        <span class="legend-label">Water Level</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background: #F59E0B;"></span>
        <span class="legend-label">Min Threshold</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background: #EF4444;"></span>
        <span class="legend-label">Max Threshold</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  },
  devices: {
    type: Array,
    default: () => []
  },
  minThreshold: {
    type: Number,
    default: 20
  },
  maxThreshold: {
    type: Number,
    default: 80
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['range-changed', 'device-changed', 'export'])

const chartCanvas = ref(null)
const chartContainer = ref(null)
const selectedRange = ref('24h')
const selectedDevice = ref('all')
const customStartDate = ref('')
const customEndDate = ref('')

let chartInstance = null

onMounted(() => {
  // Lazy load Chart.js when component is mounted
  loadChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

watch(() => props.chartData, () => {
  updateChart()
}, { deep: true })

async function loadChart() {
  // Simulate lazy loading of Chart.js
  await nextTick()
  initChart()
}

function initChart() {
  if (!chartCanvas.value) return
  
  const ctx = chartCanvas.value.getContext('2d')
  
  // Simple canvas drawing 
  drawChart(ctx)
}

function drawChart(ctx) {
  const canvas = chartCanvas.value
  const width = canvas.width = canvas.offsetWidth * 2 // Retina display
  const height = canvas.height = canvas.offsetHeight * 2
  ctx.scale(2, 2)
  
  const displayWidth = width / 2
  const displayHeight = height / 2
  
  // Clear canvas
  ctx.clearRect(0, 0, displayWidth, displayHeight)
  
  if (props.chartData.length === 0) return
  
  // Draw grid
  ctx.strokeStyle = '#E5E7EB'
  ctx.lineWidth = 1
  
  for (let i = 0; i <= 5; i++) {
    const y = (displayHeight - 60) * (i / 5) + 20
    ctx.beginPath()
    ctx.moveTo(40, y)
    ctx.lineTo(displayWidth - 20, y)
    ctx.stroke()
  }
  
  // Draw threshold lines
  const minY = displayHeight - 60 - ((props.minThreshold / 100) * (displayHeight - 80)) + 20
  const maxY = displayHeight - 60 - ((props.maxThreshold / 100) * (displayHeight - 80)) + 20
  
  ctx.strokeStyle = '#F59E0B'
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(40, minY)
  ctx.lineTo(displayWidth - 20, minY)
  ctx.stroke()
  
  ctx.strokeStyle = '#EF4444'
  ctx.beginPath()
  ctx.moveTo(40, maxY)
  ctx.lineTo(displayWidth - 20, maxY)
  ctx.stroke()
  
  ctx.setLineDash([])
  
  // Draw data line
  ctx.strokeStyle = '#10B981'
  ctx.lineWidth = 3
  ctx.beginPath()
  
  const data = props.chartData.slice(-50) // Last 50 points
  const xStep = (displayWidth - 60) / (data.length - 1)
  
  data.forEach((point, index) => {
    const x = 40 + (index * xStep)
    const y = displayHeight - 60 - ((point.value / 100) * (displayHeight - 80)) + 20
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // Draw points
  ctx.fillStyle = '#10B981'
  data.forEach((point, index) => {
    const x = 40 + (index * xStep)
    const y = displayHeight - 60 - ((point.value / 100) * (displayHeight - 80)) + 20
    
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  })
  
  // Draw Y-axis labels
  ctx.fillStyle = '#6B7280'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'right'
  
  for (let i = 0; i <= 5; i++) {
    const value = (100 / 5) * i
    const y = displayHeight - 60 - ((value / 100) * (displayHeight - 80)) + 24
    ctx.fillText(`${value}%`, 35, y)
  }
}

function updateChart() {
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')
    drawChart(ctx)
  }
}

function handleRangeChange() {
  emit('range-changed', selectedRange.value)
}

function handleDeviceChange() {
  emit('device-changed', selectedDevice.value)
}

function applyCustomRange() {
  emit('range-changed', {
    type: 'custom',
    start: customStartDate.value,
    end: customEndDate.value
  })
}

function exportData() {
  emit('export', {
    range: selectedRange.value,
    device: selectedDevice.value
  })
}
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #3B82F6;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.chart-card:hover {
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
  transform: translateY(-4px);
  border-color: #2563EB;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.title-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-group select {
  padding: 0.5rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
}

.filter-group select:hover {
  border-color: #3B82F6;
  background: #EFF6FF;
}

.filter-group select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-export {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
}

.custom-range {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.custom-range input {
  padding: 0.5rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
}

.custom-range input:focus {
  outline: none;
  border-color: #10B981;
}

.btn-apply {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-apply:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
}

.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
  min-height: 350px;
  background: linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 2px solid #E5E7EB;
  transition: all 0.3s ease;
  flex: 1;
  box-sizing: border-box;
  overflow: hidden;
}

.chart-container:hover {
  border-color: #3B82F6;
  background: linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%);
}

canvas {
  width: 100%;
  height: 100%;
  max-width: 100%;
}

.chart-loading,
.chart-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E5E7EB;
  border-top-color: #10B981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chart-empty .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.chart-empty p {
  color: #6B7280;
  font-size: 0.875rem;
  margin: 0;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .chart-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  
  .filter-group select,
  .btn-export {
    width: 100%;
  }
  
  .chart-container {
    height: 300px;
    min-height: 250px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .chart-controls {
    width: 100%;
  }
  
  .filter-group select {
    min-width: 120px;
  }
}

@media (min-width: 1025px) {
  .chart-container {
    height: 450px;
  }
}
</style>