<template>
  <div class="registration-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Register New Device</h3>
        <p class="subtitle">Add a new IoT device to your system</p>
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

      <button 
        @click="registerDevice" 
        class="btn-register"
        :disabled="loading || !deviceName.trim()"
      >
        <span class="btn-icon">{{ loading ? '' : '' }}</span>
        <span>{{ loading ? 'Registering...' : 'Register Device' }}</span>
      </button>
    </div>

    <!-- Success Display -->
    <div v-else class="success-display">
      <!-- Success Header -->
      <div class="success-header">
        <span class="success-icon"></span>
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
            <code class="credential-value">{{ registeredDevice.deviceId }}</code>
            <button @click="copyToClipboard(registeredDevice.deviceId)" class="btn-copy" title="Copy Device ID">
            </button>
          </div>
        </div>
      </div>

      <!-- Device Key (Shown Once Only) -->
      <div class="device-key-section">
        <div class="key-header">
          <span class="key-icon">🔑</span>
          <div>
            <strong>Device Key (One-Time Display)</strong>
            <p>This key will only be shown once, (Copy it now!)</p>
          </div>
        </div>
        
        <div class="key-display">
          <code class="key-value">{{ registeredDevice.deviceKey }}</code>
          <button @click="copyToClipboard(registeredDevice.deviceKey)" class="btn-copy-key">
            Copy Key
          </button>
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
          ✅ {{ copyFeedback }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const deviceName = ref('')
const loading = ref(false)
const showSuccess = ref(false)
const copyFeedback = ref('')
const errors = reactive({
  deviceName: ''
})

const registeredDevice = ref({
  name: '',
  deviceId: '',
  deviceKey: ''
})

function clearError(field) {
  errors[field] = ''
}

async function registerDevice() {
  // Validation
  if (!deviceName.value.trim()) {
    errors.deviceName = 'Device name is required'
    return
  }
  
  if (deviceName.value.length < 3) {
    errors.deviceName = 'Device name must be at least 3 characters'
    return
  }
  
  loading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate device credentials
    const deviceId = `ESP32-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    const deviceKey = `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`.toUpperCase()
    
    registeredDevice.value = {
      name: deviceName.value,
      deviceId: deviceId,
      deviceKey: deviceKey
    }
    
    showSuccess.value = true
    
  } catch (error) {
    errors.deviceName = 'Failed to register device. Please try again.'
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
Device ID: ${registeredDevice.value.deviceId}
Device Key: ${registeredDevice.value.deviceKey}

⚠️ Keep this information secure!`
  
  copyToClipboard(credentials)
}

function resetForm() {
  deviceName.value = ''
  showSuccess.value = false
  registeredDevice.value = {
    name: '',
    deviceId: '',
    deviceKey: ''
  }
  errors.deviceName = ''
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
  background: linear-gradient(135deg, #00FFE5);
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
  box-shadow: 0 8px 20px rgba(0, 255, 229, 0.4);
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
  border-color: #00FFE5;
  background: #FDF2F8;
}

.device-key-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #F9FAFB);
  border: 2px solid #E5E7EB;
  border-radius: 12px;
}

.key-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.key-icon {
  font-size: 1.2rem;
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

.security-warning {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #FEE2E2, #FECACA);
  border: 2px solid #EF4444;
  border-radius: 12px;
}

.warning-icon {
  font-size: 1.2rem;
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