<template>
  <div class="charts-view">
    <div class="container">
      <div class="charts-header">
        <h1>Historical Data Charts</h1>
        <div class="time-range-selector">
          <button
            v-for="range in timeRanges"
            :key="range.value"
            @click="selectedRange = range.value"
            :class="['btn-range', { active: selectedRange === range.value }]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <ChartCard
          title="Temperature Trend"
          :data="temperatureData"
          color="#f56565"
          unit="°C"
          icon="🌡️"
        />

        <ChartCard
          title="Humidity Trend"
          :data="humidityData"
          color="#4299e1"
          unit="%"
          icon="💧"
        />

        <ChartCard
          title="Soil Moisture Trend"
          :data="soilMoistureData"
          color="#48bb78"
          unit="%"
          icon="🌾"
        />

      </div>

      <!-- Data Table -->
      <div class="data-table-section">
        <div class="card">
          <div class="table-header">
            <h2>Data Log</h2>
            <button v-if="authStore.isAdmin" @click="exportData" class="btn-export">
              📥 Export CSV
            </button>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Temperature</th>
                  <th>Humidity</th>
                  <th>Soil Moisture</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(reading, index) in recentReadings" :key="index">
                  <td>{{ formatTimestamp(reading.timestamp) }}</td>
                  <td>{{ reading.temperature }}°C</td>
                  <td>{{ reading.humidity }}%</td>
                  <td>{{ reading.soilMoisture }}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="recentReadings.length === 0" class="no-data">
            No historical data available yet. Data will appear as sensors send readings.
          </div>
        </div>
      </div>

      <!-- Statistics Summary -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-label">Avg Temperature</div>
            <div class="stat-value">{{ averageTemperature }}°C</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💧</div>
          <div class="stat-content">
            <div class="stat-label">Avg Humidity</div>
            <div class="stat-value">{{ averageHumidity }}%</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🌾</div>
          <div class="stat-content">
            <div class="stat-label">Avg Soil Moisture</div>
            <div class="stat-value">{{ averageSoilMoisture }}%</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSensorStore } from '@/stores/sensors'
import ChartCard from '@/components/ChartCard.vue'

const authStore = useAuthStore()
const sensorStore = useSensorStore()

const timeRanges = [
  { label: 'Last Hour', value: 60 },
  { label: 'Last 6 Hours', value: 360 },
  { label: 'Last 24 Hours', value: 1440 },
  { label: 'Last Week', value: 10080 },
]

const selectedRange = ref(60)

// Filter data based on selected time range
const filteredData = computed(() => {
  const now = new Date()
  const minutesAgo = selectedRange.value
  const cutoffTime = new Date(now.getTime() - minutesAgo * 60 * 1000)

  return sensorStore.historicalData.filter(
    (reading) => new Date(reading.timestamp) >= cutoffTime
  )
})

// Prepare chart data
const temperatureData = computed(() =>
  filteredData.value.map((r) => ({
    timestamp: r.timestamp,
    value: parseFloat(r.temperature),
  }))
)

const humidityData = computed(() =>
  filteredData.value.map((r) => ({
    timestamp: r.timestamp,
    value: parseFloat(r.humidity),
  }))
)

const soilMoistureData = computed(() =>
  filteredData.value.map((r) => ({
    timestamp: r.timestamp,
    value: parseFloat(r.soilMoisture),
  }))
)


// Recent readings for table (last 20)
const recentReadings = computed(() => {
  return [...sensorStore.historicalData].reverse().slice(0, 20)
})

// Calculate averages
const averageTemperature = computed(() => {
  if (filteredData.value.length === 0) return '0.0'
  const sum = filteredData.value.reduce((acc, r) => acc + parseFloat(r.temperature), 0)
  return (sum / filteredData.value.length).toFixed(1)
})

const averageHumidity = computed(() => {
  if (filteredData.value.length === 0) return '0.0'
  const sum = filteredData.value.reduce((acc, r) => acc + parseFloat(r.humidity), 0)
  return (sum / filteredData.value.length).toFixed(1)
})

const averageSoilMoisture = computed(() => {
  if (filteredData.value.length === 0) return '0.0'
  const sum = filteredData.value.reduce((acc, r) => acc + parseFloat(r.soilMoisture), 0)
  return (sum / filteredData.value.length).toFixed(1)
})


// Format timestamp for display
function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Export data as CSV
function exportData() {
  const headers = ['Timestamp', 'Temperature', 'Humidity', 'Soil Moisture']
  const rows = sensorStore.historicalData.map((reading) => [
    reading.timestamp,
    reading.temperature,
    reading.humidity,
    reading.soilMoisture,
  ])

  let csv = headers.join(',') + '\n'
  rows.forEach((row) => {
    csv += row.join(',') + '\n'
  })

  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sensor-data-${new Date().toISOString()}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.charts-view {
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.charts-header h1 {
  font-size: 2rem;
  color: #333;
}

.time-range-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-range {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-range:hover {
  border-color: #667eea;
}

.btn-range.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.data-table-section {
  margin-bottom: 2rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header h2 {
  font-size: 1.5rem;
  color: #333;
}

.btn-export {
  padding: 0.5rem 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-export:hover {
  background: #38a169;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 3rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #999;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #333;
}

@media (max-width: 768px) {
  .charts-view {
    padding: 1rem;
  }

  .charts-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>