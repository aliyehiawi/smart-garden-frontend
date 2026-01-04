<template>
  <div class="control-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Manual Pump Control</h3>
        <p class="subtitle">Direct pump activation control</p>
      </div>

      <!-- Pump Status Indicator -->
      <div class="pump-status-indicator" :class="{ active: pumpStatus.isRunning }">
        <span class="status-dot"></span>
        <span class="status-text">{{ pumpStatus.isRunning ? 'RUNNING' : 'STANDBY' }}</span>
      </div>
    </div>

    <!-- Device Selection Info (if no device selected) -->
    <div v-if="!props.deviceId" class="device-warning">
      <span class="warning-icon">⚠️</span>
      <p>Please select a device from the device list to control the pump.</p>
    </div>

    <template v-else>
      <!-- Safety Warning -->
      <div class="safety-warning">
        <span class="warning-icon">⚠️</span>
        <div class="warning-content">
          <strong>Safety Notice:</strong>
          <p>
            Manual pump activation will override automatic controls. The pump will automatically
            stop when water reaches maximum threshold or after the configured duration.
          </p>
        </div>
      </div>

      <!-- Pump Info Display -->
      <div class="pump-info-grid">
        <div class="info-item">
          <span class="info-label">Current Status</span>
          <span class="info-value" :class="{ 'text-active': pumpStatus.isRunning }">
            {{ pumpStatus.isRunning ? 'Running' : 'Stopped' }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">Last Distance Reading</span>
          <span class="info-value reading-value" :class="readingStatusClass">
            {{ lastReadingDisplay }}
          </span>
          <span class="reading-time">{{ lastReadingTime }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Mode</span>
          <span class="info-value">
            <span class="mode-badge" :class="`mode-${pumpStatus.mode || 'auto'}`">
              {{ pumpStatus.mode === 'MANUAL' ? 'Manual' : 'Auto' }}
            </span>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">Last Updated</span>
          <span class="info-value timestamp">{{ formattedLastUpdate }}</span>
        </div>
      </div>

      <!-- Tank Status Message -->
      <div v-if="tankStatusMessage" :class="['tank-status-message', tankStatusClass]">
        {{ tankStatusMessage }}
      </div>

      <!-- Control Buttons -->
      <div class="control-buttons">
        <button @click="startPump" :disabled="!canStartPump" class="btn-control btn-start">
          <span>{{
            loading ? 'Starting...' : pumpStatus.isRunning ? 'Pump Running' : 'Start Pump'
          }}</span>
        </button>
      </div>

      <!-- Auto-Stop Info -->
      <div class="auto-stop-info">
        <span class="info-icon">ℹ️</span>
        <div class="info-content">
          <strong>Automatic Stop:</strong>
          <p>
            The pump will automatically stop when water level reaches the maximum threshold or after
            a safety timeout period.
          </p>
        </div>
      </div>

      <!-- Feedback Messages -->
      <transition name="fade">
        <div v-if="feedbackMessage" :class="['feedback-message', feedbackType]">
          <span class="feedback-icon">{{ feedbackIcon }}</span>
          <span>{{ feedbackMessage }}</span>
        </div>
      </transition>

      <!-- Running Timer when active -->
      <div v-if="pumpStatus.isRunning" class="running-timer">
        <div class="timer-bar">
          <div class="timer-fill" :style="{ width: timerProgress + '%' }"></div>
        </div>
        <p class="timer-text">Pump has been running for {{ runningTime }}.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSensorsStore } from '@/stores/sensors'
import { useThresholdsStore } from '@/stores/thresholds'
import { pumpAPI } from '@/utils/api'

// Accept deviceId as prop
const props = defineProps({
  deviceId: {
    type: Number,
    required: true,
  },
})

// sensors store
const sensorsStore = useSensorsStore()
const thresholdsStore = useThresholdsStore()
const { latestReadings } = storeToRefs(sensorsStore)
const { thresholds } = storeToRefs(thresholdsStore)

// State
const loading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const startTime = ref(null)
const elapsedSeconds = ref(0)
const pumpStatus = ref({
  isRunning: false,
  mode: 'AUTO',
  lastUpdate: null,
})

let timerInterval = null
let statusPollInterval = null

// Last Reading Computed Properties
const lastReading = computed(() => {
  if (!props.deviceId) return null
  const reading = latestReadings.value[props.deviceId]
  return reading?.waterLevel ?? null
})

const lastReadingTime = computed(() => {
  if (!props.deviceId) return 'N/A'
  const reading = latestReadings.value[props.deviceId]
  if (!reading?.timestamp) return 'N/A'

  const date = new Date(reading.timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})

const lastReadingDisplay = computed(() => {
  if (lastReading.value === null) return 'N/A'
  return `${lastReading.value.toFixed(1)} cm`
})

// Reading status indicator
const readingStatusClass = computed(() => {
  if (lastReading.value === null) return 'reading-unknown'

  const deviceThresholds = thresholds.value[props.deviceId]
  if (!deviceThresholds) return 'reading-unknown'

  const min = deviceThresholds.minThreshold ?? deviceThresholds.lowerThreshold ?? 0
  const max = deviceThresholds.maxThreshold ?? deviceThresholds.upperThreshold ?? 100

  if (lastReading.value >= max) return 'reading-critical'
  if (lastReading.value <= min) return 'reading-good'
  return 'reading-normal'
})

const formattedLastUpdate = computed(() => {
  if (!pumpStatus.value.lastUpdate) return 'N/A'
  const date = new Date(pumpStatus.value.lastUpdate)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const feedbackIcon = computed(() => {
  return feedbackType.value === 'success' ? '✅' : '❌'
})

// Tank status message based on thresholds
const tankStatusMessage = computed(() => {
  if (lastReading.value === null) return null

  const deviceThresholds = thresholds.value[props.deviceId]
  if (!deviceThresholds) return null

  const min = deviceThresholds.minThreshold ?? deviceThresholds.lowerThreshold ?? 0
  const max = deviceThresholds.maxThreshold ?? deviceThresholds.upperThreshold ?? 100

  if (lastReading.value >= max) {
    return 'CRITICAL - Tank Getting Empty (High Distance) - Pump MUST START'
  }

  if (lastReading.value <= min) {
    return 'Tank Nearly Full (Low Distance) - Pump Should Stop'
  }

  return null
})

const tankStatusClass = computed(() => {
  if (lastReading.value === null) return ''

  const deviceThresholds = thresholds.value[props.deviceId]
  if (!deviceThresholds) return ''

  const max = deviceThresholds.maxThreshold ?? deviceThresholds.upperThreshold ?? 100

  if (lastReading.value >= max) {
    return 'status-critical'
  }

  return 'status-info'
})

// Can start pump only if reading is above max threshold (tank getting empty)
const canStartPump = computed(() => {
  if (pumpStatus.value.isRunning || loading.value) return false
  if (lastReading.value === null) return false

  const deviceThresholds = thresholds.value[props.deviceId]
  if (!deviceThresholds) return true // Allow if no thresholds configured

  const max = deviceThresholds.maxThreshold ?? deviceThresholds.upperThreshold ?? 100

  // Only allow starting pump when reading >= max (tank is getting empty)
  return lastReading.value >= max
})

// Running time display
const runningTime = computed(() => {
  if (elapsedSeconds.value === 0) return '0s'

  const hours = Math.floor(elapsedSeconds.value / 3600)
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60)
  const seconds = elapsedSeconds.value % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
})

// Timer progress (0-100%)
const timerProgress = computed(() => {
  // Assume max safe running time is 10 minutes (600 seconds)
  const maxTime = 600
  const progress = (elapsedSeconds.value / maxTime) * 100
  return Math.min(progress, 100)
})

// Watch for device changes
watch(
  () => props.deviceId,
  (newDeviceId) => {
    if (newDeviceId) {
      fetchPumpStatus()
      startStatusPolling()
    } else {
      stopStatusPolling()
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  if (props.deviceId) {
    fetchPumpStatus()
    startStatusPolling()
  }
})

onUnmounted(() => {
  stopTimer()
  stopStatusPolling()
})

// Methods
async function fetchPumpStatus() {
  if (!props.deviceId) return

  try {
    const response = await pumpAPI.getStatus(props.deviceId)

    const previousRunningState = pumpStatus.value.isRunning

    // Update pump status from backend response
    pumpStatus.value = {
      isRunning: response.isRunning || false,
      mode: response.mode || 'AUTO',
      lastUpdate: response.lastUpdate || new Date().toISOString(),
    }

    // If pump just stopped, fetch latest sensor reading
    if (previousRunningState && !pumpStatus.value.isRunning) {
      console.log('Pump just stopped, fetching latest sensor data...')
      await sensorsStore.fetchWaterLevelData(props.deviceId, {
        page: 0,
        size: 1,
        sort: 'timestamp,desc',
      })
    }

    // Start timer if pump is running
    if (pumpStatus.value.isRunning && !timerInterval) {
      startTimer()
    } else if (!pumpStatus.value.isRunning && timerInterval) {
      stopTimer()
    }
  } catch (error) {
    console.error('Failed to fetch pump status:', error)
    // Don't show error message for polling failures
  }
}

function startStatusPolling() {
  stopStatusPolling() // Clear any existing interval

  // Poll every 5 seconds
  statusPollInterval = setInterval(() => {
    fetchPumpStatus()
  }, 5000)
}

function stopStatusPolling() {
  if (statusPollInterval) {
    clearInterval(statusPollInterval)
    statusPollInterval = null
  }
}

function startTimer() {
  startTime.value = Date.now() - elapsedSeconds.value * 1000

  timerInterval = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  elapsedSeconds.value = 0
}

async function startPump() {
  if (!props.deviceId) {
    feedbackMessage.value = 'No device selected'
    feedbackType.value = 'error'
    return
  }

  loading.value = true
  feedbackMessage.value = ''

  try {
    // Call backend API
    const response = await pumpAPI.start(props.deviceId)

    // Update local status
    pumpStatus.value.isRunning = true
    pumpStatus.value.mode = 'MANUAL'
    pumpStatus.value.lastUpdate = new Date().toISOString()

    // Reset and start timer
    elapsedSeconds.value = 0
    startTimer()

    feedbackMessage.value =
      'Pump started successfully! It will automatically stop when water reaches the maximum threshold.'
    feedbackType.value = 'success'

    // Don't fetch status immediately to avoid flickering
    // WebSocket will handle real-time updates

    // Clear feedback message after 7 seconds
    setTimeout(() => {
      feedbackMessage.value = ''
    }, 7000)
  } catch (error) {
    console.error('Pump start error:', error)
    feedbackMessage.value = error.message || 'Failed to start pump. Please try again.'
    feedbackType.value = 'error'

    setTimeout(() => {
      feedbackMessage.value = ''
    }, 5000)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.control-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #3b82f6;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-card:hover {
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
  transform: translateY(-4px);
  border-color: #2563eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.title-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.pump-status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s;
}

.pump-status-indicator.active {
  background: #dcfce7;
  border-color: #10b981;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9ca3af;
}

.pump-status-indicator.active .status-dot {
  background: #10b981;
  animation: pulse-status 2s ease-in-out infinite;
}

@keyframes pulse-status {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.status-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.pump-status-indicator.active .status-text {
  color: #065f46;
}

.device-warning {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 12px;
}

.device-warning .warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.device-warning p {
  margin: 0;
  color: #78350f;
  font-size: 0.875rem;
}

.safety-warning {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 12px;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-content strong {
  display: block;
  color: #92400e;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.warning-content p {
  color: #78350f;
  font-size: 0.8125rem;
  margin: 0;
  line-height: 1.4;
}

.pump-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.info-value.text-active {
  color: #10b981;
}

.info-value.timestamp {
  font-size: 0.875rem;
  color: #6b7280;
}

.info-value.reading-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.info-value.reading-critical {
  color: #dc2626;
}

.info-value.reading-good {
  color: #059669;
}

.info-value.reading-normal {
  color: #3b82f6;
}

.info-value.reading-unknown {
  color: #9ca3af;
}

.reading-time {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  margin-top: -0.25rem;
}

.mode-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.mode-MANUAL,
.mode-manual {
  background: #fef3c7;
  color: #92400e;
}

.mode-AUTO,
.mode-auto {
  background: #d1fae5;
  color: #065f46;
}

.tank-status-message {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
  border: 2px solid;
}

.tank-status-message.status-critical {
  background: #fee2e2;
  color: #991b1b;
  border-color: #ef4444;
  animation: pulse-critical 2s ease-in-out infinite;
}

.tank-status-message.status-info {
  background: #dbeafe;
  color: #1e40af;
  border-color: #3b82f6;
}

@keyframes pulse-critical {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

.control-buttons {
  display: flex;
  width: 100%;
}

.btn-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 56px;
  width: 100%;
}

.btn-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-start {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.feedback-message {
  padding: 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.feedback-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 2px solid #10b981;
}

.feedback-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 2px solid #ef4444;
}

.feedback-icon {
  font-size: 1.25rem;
}

.running-timer {
  padding: 1rem;
  background: #eff6ff;
  border: 2px solid #3b82f6;
  border-radius: 12px;
}

.timer-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.timer-text {
  font-size: 0.8125rem;
  color: #1e40af;
  margin: 0;
  text-align: center;
}

.auto-stop-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #dbeafe;
  border: 2px solid #3b82f6;
  border-radius: 12px;
}

.auto-stop-info .info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  color: #1e40af;
}

.auto-stop-info .info-content {
  flex: 1;
}

.auto-stop-info .info-content strong {
  display: block;
  color: #1e40af;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.auto-stop-info .info-content p {
  color: #1e3a8a;
  font-size: 0.8125rem;
  margin: 0;
  line-height: 1.5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .pump-info-grid {
    grid-template-columns: 1fr;
  }

  .control-buttons {
    width: 100%;
  }
}
</style>
