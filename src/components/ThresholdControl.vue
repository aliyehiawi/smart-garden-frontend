<template>
  <div class="control-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Threshold Control</h3>
        <p class="subtitle">Configure water level boundaries</p>
      </div>

      <!-- Current Status Badge -->
      <div v-if="currentDeviceId" class="status-badge" :class="statusClass">
        {{ currentStatus }}
      </div>
    </div>

    <!-- No Device Selected Warning -->
    <div v-if="!currentDeviceId" class="no-device-warning">
      <span class="warning-icon">⚠️</span>
      <div class="warning-content">
        <p>Please select a device from the device list to configure thresholds.</p>
      </div>
    </div>

    <template v-else>
      <!-- Current Thresholds Display -->
      <div class="current-thresholds">
        <div class="threshold-display">
          <div class="threshold-label">
            <span class="icon">📉</span>
            <span>Current Minimum</span>
          </div>
          <div class="threshold-value min">{{ currentMin }}%</div>
        </div>

        <div class="threshold-divider">→</div>

        <div class="threshold-display">
          <div class="threshold-label">
            <span class="icon">📈</span>
            <span>Current Maximum</span>
          </div>
          <div class="threshold-value max">{{ currentMax }}%</div>
        </div>
      </div>

      <!-- Threshold Input Form -->
      <form @submit.prevent="submitThresholds" class="threshold-form">
        <div class="form-group">
          <label for="minThreshold" class="form-label">
            <span>Minimum Threshold (%)</span>
            <span class="label-hint">Pump starts when water drops below this</span>
          </label>
          <div class="input-wrapper">
            <input
              id="minThreshold"
              v-model.number="lowerThreshold"
              type="number"
              min="0"
              max="100"
              step="1"
              required
              class="form-input"
              :class="{ 'input-error': validationError }"
            />
            <span class="input-unit">%</span>
          </div>
        </div>

        <div class="form-group">
          <label for="maxThreshold" class="form-label">
            <span>Maximum Threshold (%)</span>
            <span class="label-hint">Pump stops when water reaches this level</span>
          </label>
          <div class="input-wrapper">
            <input
              id="maxThreshold"
              v-model.number="upperThreshold"
              type="number"
              min="0"
              max="100"
              step="1"
              required
              class="form-input"
              :class="{ 'input-error': validationError }"
            />
            <span class="input-unit">%</span>
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

      <!-- Info Panel -->
      <div class="info-panel">
        <span class="info-icon">💡</span>
        <div class="info-content">
          <strong>Tip:</strong> Maintain at least 20% difference between min and max thresholds for
          optimal pump operation.
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
import { thresholdAPI } from '@/utils/api'

const sensorsStore = useSensorsStore()
const thresholdsStore = useThresholdsStore()

const { latestReadings } = storeToRefs(sensorsStore)
const { thresholds } = storeToRefs(thresholdsStore)

const lowerThreshold = ref(20)
const upperThreshold = ref(80)
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

// Get thresholds from thresholdsStore correctly
const currentThresholds = computed(() => {
  if (!currentDeviceId.value) return null
  return thresholds.value[currentDeviceId.value] || null
})

const currentMin = computed(
  () => currentThresholds.value?.minThreshold || currentThresholds.value?.lowerThreshold || 20,
)
const currentMax = computed(
  () => currentThresholds.value?.maxThreshold || currentThresholds.value?.upperThreshold || 80,
)

const currentWaterLevel = computed(() => {
  if (!currentDeviceId.value) return 0
  const reading = latestReadings.value[currentDeviceId.value]
  return reading?.waterLevel || 0
})

const currentStatus = computed(() => {
  const level = currentWaterLevel.value
  if (level < currentMin.value) return 'Below Minimum'
  if (level > currentMax.value) return 'Above Maximum'
  return 'Within Range'
})

const statusClass = computed(() => {
  const level = currentWaterLevel.value
  if (level < currentMin.value) return 'status-low'
  if (level > currentMax.value) return 'status-high'
  return 'status-normal'
})

const validationError = computed(() => {
  if (lowerThreshold.value < 0 || lowerThreshold.value > 100) {
    return 'Minimum threshold must be between 0 and 100'
  }
  if (upperThreshold.value < 0 || upperThreshold.value > 100) {
    return 'Maximum threshold must be between 0 and 100'
  }
  if (lowerThreshold.value >= upperThreshold.value) {
    return 'Minimum threshold must be less than maximum threshold'
  }
  if (upperThreshold.value - lowerThreshold.value < 10) {
    return 'Thresholds should have at least 10% difference'
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
    await loadThresholds()
  }
})

watch([currentMin, currentMax], () => {
  lowerThreshold.value = currentMin.value
  upperThreshold.value = currentMax.value
})

async function loadThresholds() {
  if (!currentDeviceId.value) {
    console.warn('Cannot load thresholds: No device selected')
    return
  }

  console.log('Loading thresholds for device:', currentDeviceId.value)

  try {
    // Use thresholdAPI.get() instead of thresholdAPI.getByDevice()
    const response = await thresholdAPI.get(currentDeviceId.value)

    if (response) {
      // Backend returns: { minThreshold, maxThreshold }
      lowerThreshold.value = response.minThreshold || response.lowerThreshold || 20
      upperThreshold.value = response.maxThreshold || response.upperThreshold || 80

      // Update store with consistent naming
      thresholdsStore.setThresholds(currentDeviceId.value, {
        minThreshold: lowerThreshold.value,
        maxThreshold: upperThreshold.value,
        lowerThreshold: lowerThreshold.value,
        upperThreshold: upperThreshold.value,
      })

      console.log('Thresholds loaded successfully')
    }
  } catch (error) {
    console.error('Failed to load thresholds:', error)
    // Use defaults on error
    lowerThreshold.value = 20
    upperThreshold.value = 80
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

  console.log('Saving thresholds for device:', currentDeviceId.value)

  try {
    // Backend expects: { minThreshold, maxThreshold }
    const response = await thresholdAPI.update(currentDeviceId.value, {
      minThreshold: lowerThreshold.value,
      maxThreshold: upperThreshold.value,
    })

    // Update store with response
    thresholdsStore.setThresholds(currentDeviceId.value, {
      minThreshold: response.minThreshold,
      maxThreshold: response.maxThreshold,
      lowerThreshold: response.minThreshold,
      upperThreshold: response.maxThreshold,
    })

    feedbackMessage.value =
      'Thresholds updated successfully. Hardware will receive new settings via MQTT.'
    feedbackType.value = 'success'

    console.log('Thresholds saved successfully')

    setTimeout(() => {
      feedbackMessage.value = ''
    }, 5000)
  } catch (error) {
    console.error('Failed to update thresholds:', error)
    feedbackMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Failed to update thresholds. Please try again.'
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
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-normal {
  background: #d1fae5;
  color: #065f46;
}

.status-low {
  background: #fef3c7;
  color: #92400e;
}

.status-high {
  background: #fee2e2;
  color: #991b1b;
}

.no-device-warning {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #fef3c7;
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

.warning-content p {
  margin: 0;
  color: #92400e;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.current-thresholds {
  display: flex;
  align-items: center;
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
}

.threshold-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.threshold-label .icon {
  font-size: 1.25rem;
}

.threshold-value {
  font-size: 2rem;
  font-weight: 700;
}

.threshold-value.min {
  color: #f59e0b;
}

.threshold-value.max {
  color: #ef4444;
}

.threshold-divider {
  font-size: 1.5rem;
  color: #d1d5db;
  flex-shrink: 0;
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
  color: #065f46;
}

.feedback-message.error {
  background: #fee2e2;
  border: 2px solid #ef4444;
  color: #991b1b;
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
  padding: 1rem;
  background: #eff6ff;
  border: 2px solid #3b82f6;
  border-radius: 10px;
}

.info-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.info-content {
  font-size: 0.8125rem;
  color: #1e40af;
  line-height: 1.4;
}

.info-content strong {
  font-weight: 600;
  display: block;
  margin-bottom: 0.125rem;
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
