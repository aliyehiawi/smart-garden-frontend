<template>
  <MainLayout>
    <div class="dashboard-container">

      <!-- HEADER - APPEARS SECOND -->
      <div class="dashboard-header">
        <div class="header-container">
          <div class="title-section">
            <div class="title-row">
              <h1>Dashboard</h1>
            </div>
            <p class="subtitle">Monitor and control your smart garden</p>
          </div>
        </div>
      </div>

      <!-- DEVICE LIST - APPEARS FIRST -->
      <DeviceList 
        v-if="authStore.user" 
        @pump-control-selected="handlePumpControlSelected"
        class="device-list-section"
      />

      <!-- NO DEVICES WARNING -->
      <div v-if="!loading && devices.length === 0" class="no-devices-warning">
        <div class="warning-icon">📡</div>
        <div class="warning-content">
          <h3>No Devices Registered Yet</h3>
          <p>Get started by registering your first IoT device to see real-time data</p>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading devices...</p>
      </div>
      
      <!-- DATA SECTIONS -->
      <template v-if="selectedDeviceId && devices.length > 0 && !loading && isDataLoaded">
        <!-- Selected Device Banner -->
        <div class="selected-device-banner">
          <div class="banner-content">
            <span class="banner-icon">📡</span>
            <div class="banner-text">
              <strong>Currently Viewing:</strong>
              <span class="device-name">{{ selectedDeviceName }}</span>
            </div>
            <span class="banner-status online">● Live</span>
          </div>
        </div>

        <!-- KPI Cards (4 Cards) -->
        <div class="kpi-grid">
          <WaterLevelCard
            :value="latestReading?.waterLevel ?? 0"
            :min="currentThresholds?.lowerThreshold ?? 0"
            :max="currentThresholds?.upperThreshold ?? 100"
          />

          <PumpStatusCard
            :isRunning="currentPumpStatus?.isRunning ?? false"
            :mode="currentPumpStatus?.manualControl ? 'MANUAL' : 'AUTO'"
            :runningTime="getPumpRunningTime()"
          />

          <DeviceStatusCard
            :isOnline="isDeviceOnline"
            :deviceName="selectedDeviceName"
            :lastSeen="getLastUpdateTime()"
          />

          <ThresholdSummaryCard
            :min="currentThresholds?.lowerThreshold ?? 0"
            :max="currentThresholds?.upperThreshold ?? 100"
            :currentValue="latestReading?.waterLevel ?? 0"
          />
        </div>

        <!-- History Chart and Table Together -->
        <div class="history-section">
          <WaterLevelHistoryChart
            :chartData="chartData"
            :devices="devicesList"
            :minThreshold="currentThresholds?.lowerThreshold ?? 0"
            :maxThreshold="currentThresholds?.upperThreshold ?? 100"
            :loading="chartLoading"
            @range-changed="handleRangeChange"
            @device-changed="handleDeviceChange"
            @export="handleExportData"
          />

          <WaterLevelTable />
        </div>
      </template>

      <!-- NO SELECTION MESSAGE -->
      <div v-else-if="!selectedDeviceId && devices.length > 0 && !loading" class="no-selection-message">
        <div class="message-content">
          <h3>Select a Device</h3>
          <p>Choose a device from the list above to view its real-time data and controls</p>
        </div>
      </div>

      <!-- LOADING DEVICE DATA -->
      <div v-else-if="selectedDeviceId && !isDataLoaded && !loading" class="loading-data-message">
        <div class="spinner"></div>
        <p>Loading device data for {{ selectedDeviceName }}...</p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useDevicesStore } from '@/stores/devices'
import { useSensorsStore } from '@/stores/sensors'
import { useThresholdsStore } from '@/stores/thresholds'
import MainLayout from '@/components/MainLayout.vue'
import WaterLevelCard from '@/components/WaterLevelCard.vue'
import PumpStatusCard from '@/components/PumpStatusCard.vue'
import DeviceStatusCard from '@/components/DeviceStatusCard.vue'
import ThresholdSummaryCard from '@/components/ThresholdSummaryCard.vue'
import WaterLevelHistoryChart from '@/components/WaterLevelHistoryChart.vue'
import WaterLevelTable from '@/components/WaterLevelTable.vue'
import DeviceList from '@/components/DeviceList.vue'

const router = useRouter()
const authStore = useAuthStore()
const devicesStore = useDevicesStore()
const sensorsStore = useSensorsStore()
const thresholdsStore = useThresholdsStore()

// Get reactive refs from stores
const { devices, loading } = storeToRefs(devicesStore)
const { latestReadings, wsConnected, waterLevelData } = storeToRefs(sensorsStore)
const { thresholds } = storeToRefs(thresholdsStore)
const { selectedDevice } = storeToRefs(devicesStore)

const previousWaterLevel = ref(null)
const chartLoading = ref(false)
const searchQuery = ref('')
const selectedDeviceId = ref(null)
const isDataLoaded = ref(false)

// Computed properties
const devicesList = computed(() => {
  if (!Array.isArray(devices.value)) return []
  return devices.value.map((device) => ({
    id: device.id,
    name: device.name || `Device-${device.id}`,
  }))
})

const selectedDeviceName = computed(() => {
  if (!selectedDeviceId.value) return 'No device selected'
  if (!Array.isArray(devices.value)) return 'No device selected'
  const device = devices.value.find((d) => d.id === selectedDeviceId.value)
  return device?.name || `Device-${selectedDeviceId.value}`
})

const latestReading = computed(() => {
  if (!selectedDeviceId.value) return null
  return latestReadings.value[selectedDeviceId.value] || null
})

const currentThresholds = computed(() => {
  if (!selectedDeviceId.value) return null
  return thresholds.value[selectedDeviceId.value] || null
})

const currentPumpStatus = computed(() => {
  if (!selectedDeviceId.value) return null
  return devicesStore.getPumpStatus(selectedDeviceId.value)
})

const chartData = computed(() => {
  if (!selectedDeviceId.value) return []
  const deviceData = waterLevelData.value[selectedDeviceId.value]
  if (!deviceData) return []

  return deviceData.content.map((reading) => ({
    value: reading.waterLevel,
    timestamp: reading.timestamp,
  }))
})

// Check if device is actually online based on last update
const isDeviceOnline = computed(() => {
  if (!latestReading.value?.timestamp) return false
  
  const lastUpdate = new Date(latestReading.value.timestamp)
  const now = new Date()
  const diffMinutes = (now - lastUpdate) / (1000 * 60)
  
  // Consider device offline if no update in last 5 minutes
  return diffMinutes < 5
})

// Watch for data loading completion
watch([latestReading, currentThresholds, currentPumpStatus], ([reading, threshold, pump]) => {
  // Data is considered loaded when we have at least thresholds
  if (threshold !== null) {
    isDataLoaded.value = true
  }
})

onMounted(async () => {
  console.log('Dashboard mounted, initializing...')

  // Fetch all devices
  await devicesStore.fetchDevices()

  // Select first device if available and load its data
  if (devices.value.length > 0) {
    const firstDevice = devices.value[0]
    await loadDeviceData(firstDevice.id)
  }
})

onUnmounted(() => {
  // Cleanup WebSocket connections
  if (selectedDeviceId.value) {
    sensorsStore.unsubscribeFromDevice(selectedDeviceId.value)
  }
  sensorsStore.disconnectWebSocket()
})

// Centralized function to load all device data
async function loadDeviceData(deviceId) {
  console.log('Loading data for device:', deviceId)
  
  // Reset data loaded flag
  isDataLoaded.value = false
  
  // Update selected device
  selectedDeviceId.value = deviceId
  devicesStore.selectDevice(deviceId)

  try {
    // Fetch all device data in parallel
    await Promise.all([
      thresholdsStore.fetchThresholds(deviceId),
      devicesStore.fetchPumpStatus(deviceId),
      sensorsStore.fetchWaterLevelData(deviceId, {
        page: 0,
        size: 20,
        sort: 'timestamp,desc',
      }),
    ])

    // Connect to WebSocket for real-time updates
    if (!wsConnected.value) {
      sensorsStore.connectWebSocket()
    }

    // Subscribe to device updates
    sensorsStore.subscribeToDevice(deviceId, {
      onSensorData: (data) => {
        console.log('New sensor data received:', data)
        previousWaterLevel.value = latestReading.value?.waterLevel || null
      },
      onPumpStatus: (status) => {
        console.log('Pump status updated:', status)
        devicesStore.updatePumpStatus(deviceId, status)
      },
      onThresholdUpdate: (thresholdData) => {
        console.log('Thresholds updated:', thresholdData)
        thresholdsStore.setThresholds(deviceId, thresholdData)
      },
    })

    console.log('Device data loaded successfully')
  } catch (error) {
    console.error('Error loading device data:', error)
    isDataLoaded.value = false
  }
}

function getLastUpdateTime() {
  if (!latestReading.value?.timestamp) return 'N/A'

  const date = new Date(latestReading.value.timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getPumpRunningTime() {
  if (!currentPumpStatus.value?.isRunning) return ''
  if (!currentPumpStatus.value?.lastStartedAt) return 'Running'

  const startTime = new Date(currentPumpStatus.value.lastStartedAt).getTime()
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return `${minutes}m ${seconds}s`
}

async function handleDeviceChange(deviceId) {
  console.log('Device changed to:', deviceId)
  
  // Unsubscribe from previous device
  if (selectedDeviceId.value) {
    sensorsStore.unsubscribeFromDevice(selectedDeviceId.value)
  }
  
  // Load new device data (this function handles everything)
  await loadDeviceData(deviceId)
}

function handleRangeChange(range) {
  console.log('Range changed:', range)
  chartLoading.value = true

  // Implement range-based data fetching
  setTimeout(() => {
    chartLoading.value = false
  }, 1000)
}

function handleExportData(options) {
  console.log('Exporting data:', options)

  if (chartData.value.length === 0) {
    console.warn('No data to export')
    return
  }

  const csvData = chartData.value.map((point) => ({
    timestamp: new Date(point.timestamp).toLocaleString(),
    waterLevel: point.value,
    minThreshold: currentThresholds.value?.lowerThreshold ?? 0,
    maxThreshold: currentThresholds.value?.upperThreshold ?? 100,
  }))

  const headers = Object.keys(csvData[0]).join(',')
  const rows = csvData.map((row) => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `water-level-history-${selectedDeviceName.value}-${new Date().toISOString()}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

async function handleDeviceRegistered() {
  console.log('New device registered, refreshing list...')
  
  // Reload devices list
  await devicesStore.fetchDevices()
  
  // Auto-select the newly registered device (usually the last one)
  if (devices.value.length > 0) {
    const latestDevice = devices.value[devices.value.length - 1]
    await loadDeviceData(latestDevice.id)
  }
  
  console.log('Device registered and list refreshed!')
}

function handlePumpControlSelected(device) {
  if (device) {
    console.log('Pump control selected for device:', device.id)
    handleDeviceChange(device.id)
  } else {
    console.log('Pump control deselected')
  }
}

function handleSearch() {
  console.log('Searching for:', searchQuery.value)
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  padding: 0; 
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: calc(100vh - 4rem); 
}

.device-list-section {
  order: -1; /* Force device list to appear first */
  margin-bottom: 1.5rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
  padding-top: 0.5rem;
}

.header-container {
  width: 100%;
}

.title-section {
  width: 100%;
  padding-top: 0.5rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.25rem;
  padding-top: 0.5rem;
}

.brand-icon,
.banner-icon,
.warning-icon {
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
}

.no-devices-warning {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border: 2px solid #F59E0B;
  border-radius: 16px;
  padding: 2.5rem;
  text-align: center;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);
}

.no-devices-warning .warning-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.no-devices-warning .warning-content h3 {
  color: #92400E;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.no-devices-warning .warning-content p {
  color: #78350F;
  font-size: 1rem;
  margin: 0;
}

.no-selection-message {
  background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
  border: 2px solid #6366F1;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1);
}

.no-selection-message .message-content h3 {
  color: #312E81;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.no-selection-message .message-content p {
  color: #4338CA;
  font-size: 1rem;
  margin: 0;
}

.loading-state,
.loading-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  margin: 2rem auto;
  max-width: 400px;
  text-align: center;
}

.loading-state p,
.loading-data-message p {
  margin-top: 1rem;
  color: #6B7280;
  font-size: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #E5E7EB;
  border-top-color: #10B981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.selected-device-banner {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.banner-icon {
  font-size: 1.5rem;
}

.banner-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.banner-text strong {
  font-weight: 600;
}

.device-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.banner-status {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.banner-status.online {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.history-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  width: 100%;
  margin-top: 1.5rem;
}

.history-section > * {
  width: 100%;
  min-height: 400px;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex-shrink: 0;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 1400px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .dashboard-container {
    padding: 0;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-section {
    gap: 1rem;
  }
  
  .history-section > * {
    min-height: 350px;
  }

  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>