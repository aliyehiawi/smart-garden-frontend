<template>
  <div class="registration-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Register New Device</h3>
        <p class="subtitle">Add a new IoT water level monitoring device</p>
      </div>
    </div>

    <!-- Registration Form -->
    <div v-if="!showSuccess" class="registration-form">
      <div class="form-group">
        <label for="deviceName" class="form-label">
          <span>Device Name</span>
          <span class="required">*</span>
        </label>
        <input
          id="deviceName"
          v-model="deviceName"
          type="text"
          placeholder="e.g., ESP32-Garden-01"
          class="form-input"
          :class="{ 'input-error': errors.deviceName }"
          @input="clearError('deviceName')"
          :disabled="loading"
        />
        <span v-if="errors.deviceName" class="error-text">{{ errors.deviceName }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="minThreshold" class="form-label">
            <span>Min Threshold (%)</span>
            <span class="required">*</span>
          </label>
          <input
            id="minThreshold"
            v-model.number="minThreshold"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="e.g., 20"
            class="form-input"
            :class="{ 'input-error': errors.minThreshold }"
            @input="clearError('minThreshold')"
            :disabled="loading"
          />
          <span v-if="errors.minThreshold" class="error-text">{{ errors.minThreshold }}</span>
        </div>

        <div class="form-group">
          <label for="maxThreshold" class="form-label">
            <span>Max Threshold (%)</span>
            <span class="required">*</span>
          </label>
          <input
            id="maxThreshold"
            v-model.number="maxThreshold"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="e.g., 80"
            class="form-input"
            :class="{ 'input-error': errors.maxThreshold }"
            @input="clearError('maxThreshold')"
            :disabled="loading"
          />
          <span v-if="errors.maxThreshold" class="error-text">{{ errors.maxThreshold }}</span>
        </div>
      </div>

      <button 
        @click="registerDevice" 
        class="btn-register"
        :disabled="loading || !deviceName.trim() || !minThreshold || !maxThreshold"
      >
        <span class="btn-icon">{{ loading ? '' : '' }}</span>
        <span>{{ loading ? 'Registering...' : 'Register Device' }}</span>
      </button>
    </div>

    <!-- Success Display -->
    <div v-else class="success-display">
      <!-- Success Header -->
      <div class="success-header">
        <span class="success-icon">✅</span>
        <div>
          <h4>Device Registered Successfully!</h4>
          <p>Please save the following credentials securely</p>
        </div>
      </div>

      <!-- Device Credentials -->
      <div class="credentials-grid">
        <div class="credential-item">
          <span class="credential-label">Device Name</span>
          <span class="credential-value">{{ registeredDevice.name }}</span>
        </div>
        
        <div class="credential-item">
          <span class="credential-label">Device ID</span>
          <div class="credential-value-wrapper">
            <code class="credential-value">{{ registeredDevice.id }}</code>
            <button @click="copyToClipboard(registeredDevice.id.toString())" class="btn-copy" title="Copy Device ID">
            </button>
          </div>
        </div>
      </div>

      <!-- Device Key, Shown Once Only -->
      <div class="device-key-section">
        <div class="key-header">
          <span class="key-icon">🔑</span>
          <div>
            <strong>Device Key (One-Time Display)</strong>
            <p>This key will only be shown once. Copy it now!</p>
          </div>
        </div>
        
        <div class="key-display">
          <code class="key-value">{{ registeredDevice.deviceKey }}</code>
          <button @click="copyToClipboard(registeredDevice.deviceKey)" class="btn-copy-key">
            Copy Key
          </button>
        </div>
      </div>

      <!-- Threshold Info -->
      <div class="info-panel">
        <div class="info-content">
          <strong>Configured Thresholds:</strong>
          <p>Min: {{ registeredDevice.minThreshold }}% | Max: {{ registeredDevice.maxThreshold }}%</p>
        </div>
      </div>

      <!-- Security Warning -->
      <div class="security-warning">
        <span class="warning-icon">⚠️</span>
        <div class="warning-content">
          <strong>Security Notice:</strong>
          <ul>
            <li>Store the Device Key securely</li>
            <li>The key will not be shown again after closing this message</li>
            <li>You'll need this key to configure the ESP32 hardware</li>
            <li>Never share this key publicly or commit it to version control</li>
          </ul>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="copyAllCredentials" class="btn-action btn-copy-all">
          Copy All Credentials
        </button>
        <button @click="resetForm" class="btn-action btn-new">
          Register Another Device
        </button>
      </div>

      <!-- Copy Feedback -->
      <transition name="fade">
        <div v-if="copyFeedback" class="copy-feedback">
          {{ copyFeedback }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { deviceAPI } from '@/utils/api'

const deviceName = ref('')
const minThreshold = ref(20)
const maxThreshold = ref(80)
const loading = ref(false)
const showSuccess = ref(false)
const copyFeedback = ref('')
const emit = defineEmits(['device-registered'])
const errors = reactive({
  deviceName: '',
  minThreshold: '',
  maxThreshold: ''
})

const registeredDevice = ref({
  id: null,
  name: '',
  deviceKey: '',
  minThreshold: 0,
  maxThreshold: 0
})

function clearError(field) {
  errors[field] = ''
}

function validateForm() {
  let isValid = true
  
  // Device Name
  if (!deviceName.value.trim()) {
    errors.deviceName = 'Device name is required'
    isValid = false
  } else if (deviceName.value.length < 3) {
    errors.deviceName = 'Device name must be at least 3 characters'
    isValid = false
  }
  
  // Min Threshold
  if (!minThreshold.value && minThreshold.value !== 0) {
    errors.minThreshold = 'Min threshold is required'
    isValid = false
  } else if (minThreshold.value < 0 || minThreshold.value > 100) {
    errors.minThreshold = 'Min threshold must be between 0 and 100'
    isValid = false
  }
  
  // Max Threshold
  if (!maxThreshold.value && maxThreshold.value !== 0) {
    errors.maxThreshold = 'Max threshold is required'
    isValid = false
  } else if (maxThreshold.value < 0 || maxThreshold.value > 100) {
    errors.maxThreshold = 'Max threshold must be between 0 and 100'
    isValid = false
  }
  
  // Threshold validation
  if (minThreshold.value >= maxThreshold.value) {
    errors.maxThreshold = 'Max threshold must be greater than min threshold'
    isValid = false
  }
  
  return isValid
}

async function registerDevice() {
  // Clear previous errors
  Object.keys(errors).forEach(key => errors[key] = '')
  
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Backend API
    const response = await deviceAPI.register({
      name: deviceName.value.trim(),
      minThreshold: minThreshold.value,
      maxThreshold: maxThreshold.value
    })
    
    // Backend returns device info
    registeredDevice.value = {
      id: response.id,
      name: response.name,
      deviceKey: response.deviceKey,
      minThreshold: response.minThreshold,
      maxThreshold: response.maxThreshold
    }
    
    showSuccess.value = true
    
    // Emit event to parent to refresh device list
    emit('device-registered')
    
  } catch (error) {
    console.error('Device registration failed:', error)
    errors.deviceName = error.response?.data?.message || error.message || 'Failed to register device. Please try again.'
  } finally {
    loading.value = false
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    copyFeedback.value = 'Copied to clipboard!'
    setTimeout(() => {
      copyFeedback.value = ''
    }, 2000)
  })
}

function copyAllCredentials() {
  const credentials = `Device Registration

Device Name: ${registeredDevice.value.name}
Device ID: ${registeredDevice.value.id}
Device Key: ${registeredDevice.value.deviceKey}
Min Threshold: ${registeredDevice.value.minThreshold}%
Max Threshold: ${registeredDevice.value.maxThreshold}%

⚠️ Keep this information secure!`
  
  copyToClipboard(credentials)
}

function resetForm() {
  // Reset form inputs
  deviceName.value = ''
  minThreshold.value = 20
  maxThreshold.value = 80
  
  // Reset showSuccess to FALSE to show the form again
  showSuccess.value = false
  
  // Clear registered device data
  registeredDevice.value = {
    id: null,
    name: '',
    deviceKey: '',
    minThreshold: 0,
    maxThreshold: 0
  }
  
  // Clear all errors
  Object.keys(errors).forEach(key => errors[key] = '')
}
</script>

<style scoped>
.registration-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #00ffe5;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.registration-card:hover {
  box-shadow: 0 8px 20px rgba(0, 255, 229, 0.2);
  transform: translateY(-4px);
  border-color: #00ffe5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #EF4444;
  font-weight: 700;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  font-size: 1rem;
  color: #1F2937;
  background: white;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #00ffe5;
  box-shadow: 0 0 0 3px rgba(0, 255, 229, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-input.input-error {
  border-color: #EF4444;
}

.error-text {
  color: #EF4444;
  font-size: 0.8125rem;
  font-weight: 500;
}

.btn-register {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 56px;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-register:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 1.25rem;
}

.success-display {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.success-header {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  border: 2px solid #10B981;
  border-radius: 12px;
}

.success-icon {
  font-size: 2rem;
}

.success-header h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #065F46;
  margin: 0 0 0.25rem 0;
}

.success-header p {
  font-size: 0.875rem;
  color: #047857;
  margin: 0;
}

.credentials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.credential-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
}

.credential-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.credential-value-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.credential-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Courier New', monospace;
  flex: 1;
  word-break: break-all;
}

.btn-copy {
  padding: 0.5rem;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  flex-shrink: 0;
}

.btn-copy:hover {
  border-color: #10B981;
  background: #F0FDF4;
}

.device-key-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border: 2px solid #F59E0B;
  border-radius: 12px;
}

.key-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.key-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.key-header strong {
  display: block;
  font-size: 1rem;
  color: #92400E;
  margin-bottom: 0.25rem;
}

.key-header p {
  font-size: 0.875rem;
  color: #78350F;
  margin: 0;
}

.key-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #F59E0B;
  border-radius: 10px;
}

.key-value {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #92400E;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  padding: 0.5rem;
  background: #FFFBEB;
  border-radius: 6px;
}

.btn-copy-key {
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-copy-key:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.info-panel {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #EFF6FF;
  border: 2px solid #3B82F6;
  border-radius: 10px;
}

.info-content {
  font-size: 0.8125rem;
  color: #1E40AF;
  line-height: 1.4;
}

.info-content strong {
  font-weight: 600;
  display: block;
  margin-bottom: 0.125rem;
}

.security-warning {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #FEE2E2, #FECACA);
  border: 2px solid #EF4444;
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
  font-size: 0.9375rem;
  color: #991B1B;
  margin-bottom: 0.5rem;
}

.warning-content ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #991B1B;
  font-size: 0.8125rem;
  line-height: 1.6;
}

.warning-content li {
  margin-bottom: 0.25rem;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy-all {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
}

.btn-copy-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-new {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

.btn-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.copy-feedback {
  padding: 1rem;
  background: #D1FAE5;
  border: 2px solid #10B981;
  border-radius: 10px;
  color: #065F46;
  font-weight: 600;
  text-align: center;
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .credentials-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .key-display {
    flex-direction: column;
  }
  
  .btn-copy-key {
    width: 100%;
  }
}
</style>