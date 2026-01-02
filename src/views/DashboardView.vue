<template>
  <MainLayout>
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-container">
          <div class="title-section">
            <div class="title-row">
              <h1>Dashboard</h1>

              <!-- Search Bar -->
              <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search devices, sensors, data..."
                  class="search-input"
                  @input="handleSearch"
                />
                <button v-if="searchQuery" @click="clearSearch" class="btn-clear">✕</button>
              </div>
            </div>
            <p class="subtitle">Monitor and control your smart garden</p>
          </div>
        </div>
      </div>

      <!-- KPI Cards - Row 1 -->
      <div class="kpi-grid">
        <WaterLevelCard
          :value="latestReading?.waterLevel || 0"
          :min="currentThresholds?.lowerThreshold || 20"
          :max="currentThresholds?.upperThreshold || 80"
        />

        <PumpStatusCard
          :isRunning="currentPumpStatus?.isRunning || false"
          :mode="currentPumpStatus?.manualControl ? 'MANUAL' : 'AUTO'"
          :runningTime="getPumpRunningTime()"
        />

        <DeviceStatusCard
          :isOnline="true"
          :deviceName="selectedDeviceName"
          :lastSeen="getLastUpdateTime()"
        />

        <ThresholdSummaryCard
          :min="currentThresholds?.lowerThreshold || 20"
          :max="currentThresholds?.upperThreshold || 80"
          :currentValue="latestReading?.waterLevel || 0"
        />
      </div>

      <!-- Live Chart - Row 2 -->
      <div class="row-2-grid">
        <LiveSensorDataCard
          :waterLevel="latestReading?.waterLevel || 0"
          :lastUpdate="getLastUpdateTime()"
          :isLive="wsConnected"
          :devices="devicesList"
          :previousValue="previousWaterLevel"
          @device-changed="handleDeviceChange"
        />

        <WaterLevelHistoryChart
          :chartData="chartData"
          :devices="devicesList"
          :minThreshold="currentThresholds?.lowerThreshold || 20"
          :maxThreshold="currentThresholds?.upperThreshold || 80"
          :loading="chartLoading"
          @range-changed="handleRangeChange"
          @device-changed="handleDeviceChange"
          @export="handleExportData"
        />
      </div>

      <!-- Water Level History Table - Row 3 -->
      <WaterLevelTable />

      <!-- Devices List - Row 4 -->
      <DeviceList v-if="authStore.user" @pump-control-selected="handlePumpControlSelected" />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
import LiveSensorDataCard from '@/components/LiveSensorDataCard.vue'
import WaterLevelHistoryChart from '@/components/WaterLevelHistoryChart.vue'
import WaterLevelTable from '@/components/WaterLevelTable.vue'
import DeviceList from '@/components/DeviceList.vue'

const router = useRouter()
const authStore = useAuthStore()
const devicesStore = useDevicesStore()
const sensorsStore = useSensorsStore()
const thresholdsStore = useThresholdsStore()

// Get reactive refs from stores
const { devices } = storeToRefs(devicesStore)
const { latestReadings, wsConnected, waterLevelData } = storeToRefs(sensorsStore)
const { thresholds } = storeToRefs(thresholdsStore)
const { selectedDevice } = storeToRefs(devicesStore)

const previousWaterLevel = ref(null)
const chartLoading = ref(false)
const searchQuery = ref('')
const selectedDeviceId = ref(null)

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

onMounted(async () => {
  console.log('Dashboard mounted, initializing...')

  // 1. Fetch all devices
  await devicesStore.fetchDevices()

  // 2. Select first device if available
  if (devices.value.length > 0) {
    const firstDevice = devices.value[0]
    selectedDeviceId.value = firstDevice.id
    devicesStore.selectDevice(firstDevice.id)
    console.log('Selected device:', firstDevice.id)

    // 3. Fetch thresholds for selected device
    await thresholdsStore.fetchThresholds(firstDevice.id)

    // 4. Fetch pump status
    await devicesStore.fetchPumpStatus(firstDevice.id)

    // 5. Fetch water level data (last 20 records)
    await sensorsStore.fetchWaterLevelData(firstDevice.id, {
      page: 0,
      size: 20,
      sort: 'timestamp,desc',
    })

    // 6. Connect to WebSocket for real-time updates
    sensorsStore.connectWebSocket()

    // 7. Subscribe to device updates
    sensorsStore.subscribeToDevice(firstDevice.id, {
      onSensorData: (data) => {
        console.log('New sensor data received:', data)
        previousWaterLevel.value = latestReading.value?.waterLevel || null
      },
      onPumpStatus: (status) => {
        console.log('Pump status updated:', status)
        devicesStore.updatePumpStatus(firstDevice.id, status)
      },
      onThresholdUpdate: (thresholdData) => {
        console.log('Thresholds updated:', thresholdData)
        thresholdsStore.setThresholds(firstDevice.id, thresholdData)
      },
    })
  }
})

onUnmounted(() => {
  // Cleanup WebSocket connections
  if (selectedDeviceId.value) {
    sensorsStore.unsubscribeFromDevice(selectedDeviceId.value)
  }
  sensorsStore.disconnectWebSocket()
})

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

  // Update selected device
  selectedDeviceId.value = deviceId
  devicesStore.selectDevice(deviceId)

  // Fetch new device data
  await Promise.all([
    thresholdsStore.fetchThresholds(deviceId),
    devicesStore.fetchPumpStatus(deviceId),
    sensorsStore.fetchWaterLevelData(deviceId, {
      page: 0,
      size: 20,
      sort: 'timestamp,desc',
    }),
  ])

  // Subscribe to new device
  sensorsStore.subscribeToDevice(deviceId, {
    onSensorData: (data) => {
      previousWaterLevel.value = latestReading.value?.waterLevel || null
    },
    onPumpStatus: (status) => {
      devicesStore.updatePumpStatus(deviceId, status)
    },
    onThresholdUpdate: (thresholdData) => {
      thresholdsStore.setThresholds(deviceId, thresholdData)
    },
  })
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

  const csvData = chartData.value.map((point) => ({
    timestamp: new Date(point.timestamp).toLocaleString(),
    waterLevel: point.value,
    minThreshold: currentThresholds.value?.lowerThreshold || 20,
    maxThreshold: currentThresholds.value?.upperThreshold || 80,
  }))

  const headers = Object.keys(csvData[0]).join(',')
  const rows = csvData.map((row) => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `water-level-history-${new Date().toISOString()}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

async function handleDeviceRegistered() {
  // Reload devices list
  await devicesStore.fetchDevices()
  console.log('Device registered and list refreshed!')
}

function handlePumpControlSelected(device) {
  if (device) {
    console.log('Pump control selected for device:', device.id)
    selectedDeviceId.value = device.id
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

.title-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.25rem;
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

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
  flex: 0 1 auto;
  min-width: 400px;
  max-width: 600px;
}

.search-bar:focus-within {
  border-color: #16a34a;
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
  color: #9ca3af;
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

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width: 100%;
}

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

.row-5-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
    padding: 1.5rem;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .row-2-grid {
    grid-template-columns: 1fr;
  }

  .row-5-grid {
    grid-template-columns: 1fr;
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

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
