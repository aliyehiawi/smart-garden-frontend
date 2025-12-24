<template>
  <MainLayout>
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-container">
          <div class="title-section">
            <div class="title-row">
              <h1>Dashboard</h1>
              
              <!-- Search Bar - Now inline with title -->
              <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Search devices, sensors, data..."
                  class="search-input"
                  @input="handleSearch"
                />
                <button v-if="searchQuery" @click="clearSearch" class="btn-clear">
                  ✕
                </button>
              </div>
            </div>
            <p class="subtitle">Monitor and control your smart garden</p>
          </div>
        </div>
      </div>

      <!-- KPI Cards - Row 1 -->
      <div class="kpi-grid">
        <WaterLevelCard 
          :value="sensorStore.currentReadings.waterLevel"
          :min="sensorStore.thresholds.waterLevel.min"
          :max="sensorStore.thresholds.waterLevel.max"
        />
        
        <PumpStatusCard 
          :isRunning="sensorStore.pumpStatus.isRunning"
          :mode="sensorStore.pumpStatus.mode"
          :runningTime="getPumpRunningTime()"
        />
        
        <DeviceStatusCard 
          :isOnline="true"
          deviceName="ESP32-Garden-01"
          :lastSeen="getLastUpdateTime()"
        />

        <ThresholdSummaryCard 
          :min="sensorStore.thresholds.waterLevel.min"
          :max="sensorStore.thresholds.waterLevel.max"
          :currentValue="sensorStore.currentReadings.waterLevel"
        />
      </div>

      <!-- Live Chart - Row 2 -->
      <div class="row-2-grid">
        <LiveSensorDataCard 
          :waterLevel="sensorStore.currentReadings.waterLevel"
          :lastUpdate="getLastUpdateTime()"
          :isLive="true"
          :devices="devices"
          :previousValue="previousWaterLevel"
          @device-changed="handleDeviceChange"
        />
        
        <WaterLevelHistoryChart 
          :chartData="chartData"
          :devices="devices"
          :minThreshold="sensorStore.thresholds.waterLevel.min"
          :maxThreshold="sensorStore.thresholds.waterLevel.max"
          :loading="chartLoading"
          @range-changed="handleRangeChange"
          @device-changed="handleDeviceChange"
          @export="handleExportData"
        />
      </div>

      <!-- Water Level History Table - Row 3 (ALL USERS) -->
      <WaterLevelTable />

      <!-- Devices List - Row 4 (ALL USERS - Read Only for normal users) -->
      <DeviceList v-if="authStore.user" />

      <!-- ADMIN ONLY SECTIONS - Row 5 -->
      <template v-if="authStore.isAdmin">
        <div class="row-5-grid">
          <!-- Manual Pump Control -->
          <ManualPumpControl />

          <!-- Threshold Control -->
          <ThresholdControl />
        </div>

        <!-- Device Registration - Row 6 -->
        <DeviceRegistration />

        <!-- User Registration - Row 7 -->
        <UserRegistration />

        <!-- User Management - Row 8 -->
        <UserManagement />
      </template>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSensorStore } from '@/stores/sensors'
import MainLayout from '@/components/MainLayout.vue'
import WaterLevelCard from '@/components/WaterLevelCard.vue'
import PumpStatusCard from '@/components/PumpStatusCard.vue'
import DeviceStatusCard from '@/components/DeviceStatusCard.vue'
import ThresholdSummaryCard from '@/components/ThresholdSummaryCard.vue'
import LiveSensorDataCard from '@/components/LiveSensorDataCard.vue'
import WaterLevelHistoryChart from '@/components/WaterLevelHistoryChart.vue'
import WaterLevelTable from '@/components/WaterLevelTable.vue'
import DeviceList from '@/components/DeviceList.vue'
import ManualPumpControl from '@/components/ManualPumpControl.vue'
import ThresholdControl from '@/components/ThresholdControl.vue'
import DeviceRegistration from '@/components/DeviceRegistration.vue'
import UserRegistration from '@/components/UserRegistration.vue'

const router = useRouter()
const authStore = useAuthStore()
const sensorStore = useSensorStore()
const previousWaterLevel = ref(null)
const chartLoading = ref(false)
const searchQuery = ref('')


// Mock devices (replace with real data from store/API)
const devices = ref([
  { id: 1, name: 'ESP32-Garden-01' }
])

// WebSocket connection (placeholder)
let ws = null

// Chart data
const chartData = computed(() => {
  return sensorStore.historicalData.slice(-20).map(reading => ({
    value: reading.waterLevel,
    timestamp: reading.timestamp
  }))
})

onMounted(() => {
  // Start simulation for demo purposes
  sensorStore.startSimulation()
  
  // TODO: Connect to WebSocket in production
  // connectWebSocket()
})

onUnmounted(() => {
  // Clean up WebSocket
  if (ws) {
    ws.close()
  }
})

function connectWebSocket() {
  // TODO: Implement WebSocket connection
  // ws = new WebSocket('ws://your-backend-url/api/ws')
  // ws.onmessage = handleWebSocketMessage
}

function handleWebSocketMessage(event) {
  const data = JSON.parse(event.data)
  if (data.type === 'sensor_update') {
    sensorStore.updateCurrentReadings({
      waterLevel: data.water_level,
      deviceId: data.device_id
    })
  }
}


function getLastUpdateTime() {
  if (!sensorStore.currentReadings.timestamp) return 'N/A'
  
  const date = new Date(sensorStore.currentReadings.timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getPumpRunningTime() {
  if (!sensorStore.pumpStatus.isRunning) return ''
  
  // Calculate running time from store
  const startTime = sensorStore.pumpStatus.startTime || Date.now()
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  
  return `${minutes}m ${seconds}s`
}

function startPumpManually() {
  sensorStore.togglePump(true) // true = manual mode
  pumpMessage.value = '✅ Pump started manually, Hardware will detect the flag and activate'
  
  setTimeout(() => {
    pumpMessage.value = ''
  }, 5000)
}

function handleDeviceChange(deviceId) {
  console.log('Device changed:', deviceId)
  // TODO: Fetch data for selected device
}

function handleRangeChange(range) {
  console.log('Range changed:', range)
  chartLoading.value = true
  
  // Simulate loading
  setTimeout(() => {
    chartLoading.value = false
  }, 1000)
  
  // TODO: Fetch data for selected range
}

function handleExportData(options) {
  console.log('Exporting data:', options)
  
  // Prepare CSV data
  const csvData = sensorStore.historicalData.map(reading => ({
    timestamp: new Date(reading.timestamp).toLocaleString(),
    waterLevel: reading.waterLevel,
    minThreshold: sensorStore.thresholds.waterLevel.min,
    maxThreshold: sensorStore.thresholds.waterLevel.max
  }))
  
  // Convert to CSV string
  const headers = Object.keys(csvData[0]).join(',')
  const rows = csvData.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')
  
  // Download file
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `water-level-history-${new Date().toISOString()}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

function handleSearch() {
  // TODO: Implement search functionality
  console.log('Searching for:', searchQuery.value)
}

function clearSearch() {
  searchQuery.value = ''
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.header-container {
  width: 100%;
}

.title-section {
  width: 100%;
}

/* Title row with search bar inline */
.title-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.25rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  flex-shrink: 0;
}

.subtitle {
  color: #6B7280;
  margin: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  transition: all 0.2s;
  flex: 0 1 auto;
  min-width: 400px;
  max-width: 600px;
}

.search-bar:focus-within {
  border-color: #16A34A;
  background: white;
}

.search-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: #374151;
  width: 100%;
  min-width: 150px;
}

.btn-clear {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  flex-shrink: 0;
}

.btn-clear:hover {
  color: #374151;
}

/* KPI Grid - 4 cards in a row, then 2x2, then 1 column */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width: 100%;
}

/* Row 2 Grid - Live Data and Chart side by side */
.row-2-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
  align-items: stretch;
  min-height: 550px;
}

.row-2-grid > * {
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

@media (max-width: 1400px) {
  .row-2-grid {
    grid-template-columns: 1fr 1fr;
    min-height: 520px;
  }
}

@media (max-width: 1200px) {
  .row-2-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 1024px) {
  .row-2-grid {
    grid-template-columns: 1fr;
    align-items: stretch;
    min-height: auto;
  }
  
  .row-2-grid > * {
    min-height: 450px;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .row-2-grid > * {
    min-height: 380px;
  }
}

/* Row 5 Grid - Admin Control Cards side by side */
.row-5-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 1024px) {
  .row-5-grid {
    grid-template-columns: 1fr;
  }
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 1rem 0;
}

/* Large Screens - More spacing */
@media (min-width: 1600px) {
  .dashboard-container {
    padding: 2.5rem 4rem;
  }
  
  .kpi-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Medium screens - 2x2 grid */
@media (max-width: 1400px) {
  .dashboard-container {
    padding: 2rem;
  }
  
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .admin-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 1024px) {
  .dashboard-container {
    padding: 1.5rem;
  }
  
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .search-bar {
    width: 100%;
    max-width: 100%;
  }
}

/* Mobile - 1 column */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .header-container {
    padding: 0;
  }
  
  .title-section {
    text-align: left;
  }
  
  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .search-bar {
    width: 100%;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-grid {
    grid-template-columns: 1fr;
  }
}
</style>