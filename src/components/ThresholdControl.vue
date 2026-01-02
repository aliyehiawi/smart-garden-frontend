<template>
  <div class="control-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Threshold Control</h3>
        <p class="subtitle">Configure water level boundaries for automatic pump control</p>
      </div>

      <!-- Current Status Badge -->
      <div v-if="currentDeviceId && hasData" class="status-badge" :class="statusClass">
        {{ currentStatus }}
      </div>
    </div>

    <!-- No Device Selected Warning -->
    <div v-if="!currentDeviceId" class="no-device-warning">
      <span class="warning-icon">⚠️</span>
      <div class="warning-content">
        <p>Please select a device from the device list to configure thresholds</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading threshold data...</p>
    </div>

    <!-- No Data Available -->
    <div v-else-if="!hasData" class="no-data-warning">
      <span class="warning-icon">📊</span>
      <div class="warning-content">
        <p>No threshold data available for this device. Please configure thresholds below.</p>
      </div>
    </div>

    <template v-else>
      <!-- Current Reading and Pump Status -->
      <div class="current-status-panel">
        <div class="status-row">
          <div class="status-item">
            <span class="status-label">Current Distance Reading</span>
            <span class="status-value" :class="getReadingClass">
              {{ currentWaterLevel !== null ? currentWaterLevel.toFixed(1) : 'N/A' }} cm
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Pump Status</span>
            <span class="pump-status" :class="pumpStatusClass">
              <span class="status-dot"></span>
              {{ pumpStatusText }}
            </span>
          </div>
        </div>
        
        <!-- Pump Control Logic Explanation -->
        <div v-if="currentWaterLevel !== null" class="logic-explanation">
          <div class="logic-icon">💡</div>
          <div class="logic-content">
            <strong>Automatic Pump Control Logic:</strong>
            <ul>
              <li><strong>Pump Starts:</strong> When distance ≥ {{ currentMax }} cm (tank is getting empty)</li>
              <li><strong>Pump Stops:</strong> When distance ≤ {{ currentMin }} cm (tank is nearly full)</li>
              <li><strong>Current Reading:</strong> {{ currentWaterLevel.toFixed(1) }} cm → {{ getPumpAction }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Current Thresholds Display -->
      <div class="current-thresholds">
        <div class="threshold-display">
          <div class="threshold-label">
            <span class="icon">🔽</span>
            <span>Minimum Threshold (Stop Pump)</span>
          </div>
          <div class="threshold-value min">{{ currentMin }} cm</div>
          <div class="threshold-description">Tank is nearly full - Pump will STOP</div>
        </div>

        <div class="threshold-divider">↔</div>

        <div class="threshold-display">
          <div class="threshold-label">
            <span class="icon">🔼</span>
            <span>Maximum Threshold (Start Pump)</span>
          </div>
          <div class="threshold-value max">{{ currentMax }} cm</div>
          <div class="threshold-description">Tank is getting empty - Pump will START</div>
        </div>
      </div>

      <!-- Threshold Input Form -->
      <form @submit.prevent="submitThresholds" class="threshold-form">
        <div class="form-group">
          <label for="minThreshold" class="form-label">
            <span>Minimum Threshold (cm) - Stop Pump Distance</span>
            <span class="label-hint">Pump STOPS when distance reading ≤ this value (tank nearly full)</span>
          </label>
          <div class="input-wrapper">
            <input
              id="minThreshold"
              v-model.number="lowerThreshold"
              type="number"
              min="0"
              max="200"
              step="0.1"
              required
              class="form-input"
              :class="{ 'input-error': validationError }"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>

        <div class="form-group">
          <label for="maxThreshold" class="form-label">
            <span>Maximum Threshold (cm) - Start Pump Distance</span>
            <span class="label-hint">Pump STARTS when distance reading ≥ this value (tank getting empty)</span>
          </label>
          <div class="input-wrapper">
            <input
              id="maxThreshold"
              v-model.number="upperThreshold"
              type="number"
              min="0"
              max="200"
              step="0.1"
              required
              class="form-input"
              :class="{ 'input-error': validationError }"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>

        <!-- Validation Error -->
        <div v-if="validationError" class="validation-error">
          <span class="error-icon">⚠️</span>
          <span>{{ validationError }}</span>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-submit" :disabled="loading || !!validationError">
          <span class="btn-icon">{{ loading ? '' : '' }}</span>
          <span>{{ loading ? 'Saving...' : 'Save Thresholds' }}</span>
        </button>
      </form>

      <!-- Feedback Messages -->
      <transition name="fade">
        <div v-if="feedbackMessage" :class="['feedback-message', feedbackType]">
          <span class="feedback-icon">{{ feedbackIcon }}</span>
          <div class="feedback-content">
            <strong>{{ feedbackTitle }}</strong>
            <p>{{ feedbackMessage }}</p>
          </div>
        </div>
      </transition>

      <!-- Info Panel with Example -->
      <div class="info-panel">
        <span class="info-icon">📊</span>
        <div class="info-content">
          <strong>Example Scenario:</strong>
          <p>If Max Threshold = {{ currentMax }} cm and Current Reading = {{ (currentMax - 1.2).toFixed(1) }} cm:</p>
          <p>Since {{ (currentMax - 1.2).toFixed(1) }} cm &lt; {{ currentMax }} cm → Tank is NOT empty enough → Pump will NOT start</p>
          <p>If Current Reading = {{ (currentMax + 1.5).toFixed(1) }} cm → Since {{ (currentMax + 1.5).toFixed(1) }} cm ≥ {{ currentMax }} cm → Tank is empty enough → Pump CAN START</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSensorsStore } from '@/stores/sensors'
import { useThresholdsStore } from '@/stores/thresholds'
import { useDevicesStore } from '@/stores/devices'
import { thresholdAPI } from '@/utils/api'

const sensorsStore = useSensorsStore()
const thresholdsStore = useThresholdsStore()
const devicesStore = useDevicesStore()

const { latestReadings } = storeToRefs(sensorsStore)
const { thresholds } = storeToRefs(thresholdsStore)

const lowerThreshold = ref(null)
const upperThreshold = ref(null)
const loading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')

const props = defineProps({
  deviceId: {
    type: Number,
    default: null,
  },
})

const currentDeviceId = computed(() => props.deviceId)

const currentThresholds = computed(() => {
  if (!currentDeviceId.value) return null
  return thresholds.value[currentDeviceId.value] || null
})

const hasData = computed(() => {
  return currentThresholds.value !== null && 
         currentThresholds.value !== undefined &&
         (currentThresholds.value.minThreshold !== undefined || 
          currentThresholds.value.lowerThreshold !== undefined)
})

const currentMin = computed(() => {
  if (!currentThresholds.value) return null
  return currentThresholds.value.minThreshold ?? currentThresholds.value.lowerThreshold ?? null
})

const currentMax = computed(() => {
  if (!currentThresholds.value) return null
  return currentThresholds.value.maxThreshold ?? currentThresholds.value.upperThreshold ?? null
})

const currentWaterLevel = computed(() => {
  if (!currentDeviceId.value) return null
  const reading = latestReadings.value[currentDeviceId.value]
  return reading?.waterLevel ?? null
})

const currentPumpStatus = computed(() => {
  if (!currentDeviceId.value) return null
  return devicesStore.getPumpStatus(currentDeviceId.value)
})

const currentStatus = computed(() => {
  if (currentWaterLevel.value === null || currentMin.value === null || currentMax.value === null) {
    return 'No Data Available'
  }
  
  const level = currentWaterLevel.value
  
  if (level >= currentMax.value) return 'Tank Getting Empty - Pump Should Start'
  if (level <= currentMin.value) return 'Tank Nearly Full - Pump Should Stop'
  return 'Normal Range - No Action Needed'
})

const statusClass = computed(() => {
  if (currentWaterLevel.value === null || currentMin.value === null || currentMax.value === null) {
    return 'status-unknown'
  }
  
  const level = currentWaterLevel.value
  
  if (level >= currentMax.value) return 'status-high'
  if (level <= currentMin.value) return 'status-low'
  return 'status-normal'
})

const getReadingClass = computed(() => {
  if (currentWaterLevel.value === null || currentMin.value === null || currentMax.value === null) {
    return 'reading-unknown'
  }
  
  const level = currentWaterLevel.value
  
  if (level >= currentMax.value) return 'reading-critical'
  if (level <= currentMin.value) return 'reading-good'
  return 'reading-normal'
})

const pumpStatusText = computed(() => {
  if (!currentPumpStatus.value) return 'Unknown'
  return currentPumpStatus.value.isRunning ? 'RUNNING' : 'STOPPED'
})

const pumpStatusClass = computed(() => {
  if (!currentPumpStatus.value) return 'pump-unknown'
  return currentPumpStatus.value.isRunning ? 'pump-running' : 'pump-stopped'
})

const getPumpAction = computed(() => {
  if (currentWaterLevel.value === null || currentMin.value === null || currentMax.value === null) {
    return 'Waiting for data...'
  }
  
  const level = currentWaterLevel.value
  
  if (level >= currentMax.value) {
    return 'Pump SHOULD START (distance ≥ max threshold)'
  }
  
  if (level <= currentMin.value) {
    return 'Pump SHOULD STOP (distance ≤ min threshold)'
  }
  
  return 'No action needed (within normal range)'
})

const validationError = computed(() => {
  if (lowerThreshold.value === null || upperThreshold.value === null) {
    return 'Please enter both threshold values'
  }
  
  if (lowerThreshold.value < 0 || lowerThreshold.value > 200) {
    return 'Minimum threshold must be between 0 and 200 cm'
  }
  if (upperThreshold.value < 0 || upperThreshold.value > 200) {
    return 'Maximum threshold must be between 0 and 200 cm'
  }
  if (lowerThreshold.value >= upperThreshold.value) {
    return 'Minimum threshold must be LESS than maximum threshold'
  }
  if (upperThreshold.value - lowerThreshold.value < 5) {
    return 'Thresholds should have at least 5 cm difference'
  }
  return null
})

const feedbackIcon = computed(() => {
  return feedbackType.value === 'success' ? '✅' : '❌'
})

const feedbackTitle = computed(() => {
  return feedbackType.value === 'success' ? 'Success!' : 'Error!'
})

onMounted(async () => {
  if (currentDeviceId.value) {
    await loadThresholds()
  }
})

watch(currentDeviceId, async (newDeviceId) => {
  console.log('🔄 Device ID changed in ThresholdControl:', newDeviceId)
  if (newDeviceId) {
    // Reset values
    lowerThreshold.value = null
    upperThreshold.value = null
    await loadThresholds()
  }
})

watch([currentMin, currentMax], ([newMin, newMax]) => {
  if (newMin !== null) lowerThreshold.value = newMin
  if (newMax !== null) upperThreshold.value = newMax
})

async function loadThresholds() {
  if (!currentDeviceId.value) {
    console.warn('⚠️ Cannot load thresholds: No device selected')
    return
  }

  loading.value = true
  console.log('Loading thresholds for device:', currentDeviceId.value)

  try {
    const response = await thresholdAPI.getByDevice(currentDeviceId.value)

    if (response) {
      const minValue = response.minThreshold ?? response.lowerThreshold
      const maxValue = response.maxThreshold ?? response.upperThreshold
      
      lowerThreshold.value = minValue
      upperThreshold.value = maxValue

      thresholdsStore.setThresholds(currentDeviceId.value, {
        minThreshold: minValue,
        maxThreshold: maxValue,
        lowerThreshold: minValue,
        upperThreshold: maxValue,
      })

      console.log('Thresholds loaded:', { min: minValue, max: maxValue })
    }
  } catch (error) {
    console.error('Failed to load thresholds:', error)
    feedbackMessage.value = 'Failed to load thresholds. Please enter values manually.'
    feedbackType.value = 'error'
    
    setTimeout(() => {
      feedbackMessage.value = ''
    }, 5000)
  } finally {
    loading.value = false
  }
}

async function submitThresholds() {
  if (!currentDeviceId.value) {
    feedbackMessage.value = 'Please select a device first'
    feedbackType.value = 'error'
    return
  }

  if (validationError.value) return

  loading.value = true
  feedbackMessage.value = ''

  console.log('Saving thresholds for device:', currentDeviceId.value, {
    min: lowerThreshold.value,
    max: upperThreshold.value
  })

  try {
    const response = await thresholdAPI.update(currentDeviceId.value, {
      minThreshold: lowerThreshold.value,
      maxThreshold: upperThreshold.value,
    })

    thresholdsStore.setThresholds(currentDeviceId.value, {
      minThreshold: response.minThreshold,
      maxThreshold: response.maxThreshold,
      lowerThreshold: response.minThreshold,
      upperThreshold: response.maxThreshold,
    })

    feedbackMessage.value =
      'Thresholds updated successfully. Automatic pump control will use these new values via MQTT.'
    feedbackType.value = 'success'

    console.log('Thresholds saved successfully:', response)

    setTimeout(() => {
      feedbackMessage.value = ''
    }, 5000)
  } catch (error) {
    console.error('Failed to update thresholds:', error)
    feedbackMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Failed to update thresholds, Please try again!'
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
/* Keep all existing styles exactly the same */
.control-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #10b981;
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
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
  transform: translateY(-4px);
  border-color: #059669;
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

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  max-width: 300px;
}

.status-normal {
  background: #d1fae5;
  color: #065f46;
}

.status-low {
  background: #dbeafe;
  color: #1e40af;
}

.status-high {
  background: #fee2e2;
  color: #991b1b;
}

.status-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.no-device-warning,
.no-data-warning {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 12px;
}

.warning-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-content p {
  margin: 0;
  color: #92400e;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.current-status-panel {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
}

.status-value {
  font-size: 1.75rem;
  font-weight: 700;
  padding: 0.5rem;
  border-radius: 8px;
  background: white;
  text-align: center;
}

.reading-critical {
  color: #dc2626;
  border: 2px solid #fecaca;
}

.reading-good {
  color: #059669;
  border: 2px solid #a7f3d0;
}

.reading-normal {
  color: #3b82f6;
  border: 2px solid #bfdbfe;
}

.reading-unknown {
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.pump-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: white;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.pump-running .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.pump-stopped .status-dot {
  background: #6b7280;
}

.pump-unknown .status-dot {
  background: #d1d5db;
}

.pump-running {
  color: #059669;
}

.pump-stopped {
  color: #6b7280;
}

.pump-unknown {
  color: #9ca3af;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.logic-explanation {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 2px dashed #3b82f6;
}

.logic-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.logic-content {
  flex: 1;
}

.logic-content strong {
  display: block;
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.logic-content ul {
  margin: 0;
  padding-left: 1.25rem;
  list-style-type: disc;
}

.logic-content li {
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0.25rem;
}

.current-thresholds {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: 12px;
  border: 2px solid #10b981;
}

.threshold-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.threshold-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.threshold-label .icon {
  font-size: 1.25rem;
}

.threshold-value {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
}

.threshold-value.min {
  color: #3b82f6;
}

.threshold-value.max {
  color: #ef4444;
}

.threshold-description {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
  margin-top: 0.25rem;
}

.threshold-divider {
  font-size: 1.5rem;
  color: #d1d5db;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.threshold-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.label-hint {
  font-weight: 400;
  color: #9ca3af;
  font-size: 0.75rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  color: #1f2937;
  background: white;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input.input-error {
  border-color: #ef4444;
}

.input-unit {
  position: absolute;
  right: 1rem;
  font-weight: 600;
  color: #6b7280;
  pointer-events: none;
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #fee2e2;
  border: 2px solid #ef4444;
  border-radius: 10px;
  color: #991b1b;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-icon {
  font-size: 1.25rem;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 56px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feedback-message {
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.feedback-message.success {
  background: #d1fae5;
  border: 2px solid #10b981;
}

.feedback-message.error {
  background: #fee2e2;
  border: 2px solid #ef4444;
}

.feedback-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feedback-content strong {
  display: block;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.info-panel {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #fffbeb;
  border: 2px solid #f59e0b;
  border-radius: 10px;
}

.info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-content {
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.6;
}

.info-content strong {
  font-weight: 700;
  display: block;
  margin-bottom: 0.5rem;
  color: #78350f;
}

.info-content p {
  margin: 0.25rem 0;
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

  .current-thresholds {
    flex-direction: column;
    text-align: center;
  }

  .threshold-divider {
    transform: rotate(90deg);
  }
}
</style>
