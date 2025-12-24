<template>
  <div class="control-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Manual Pump Control</h3>
        <p class="subtitle">Direct pump activation control</p>
      </div>
      
      <!-- Pump Status Indicator -->
      <div class="pump-status-indicator" :class="{ active: isRunning }">
        <span class="status-dot"></span>
        <span class="status-text">{{ isRunning ? 'RUNNING' : 'STANDBY' }}</span>
      </div>
    </div>

    <!-- Safety Warning -->
    <div class="safety-warning">
      <span class="warning-icon">⚠️</span>
      <div class="warning-content">
        <strong>Safety Notice:</strong>
        <p>Manual pump activation will override automatic controls. The pump will automatically stop when water reaches maximum threshold ({{ maxThreshold }}%).</p>
      </div>
    </div>

    <!-- Pump Info Display -->
    <div class="pump-info-grid">
      <div class="info-item">
        <span class="info-label">Current Status</span>
        <span class="info-value" :class="{ 'text-active': isRunning }">
          {{ isRunning ? 'Running' : 'Stopped' }}
        </span>
      </div>
      
      <div class="info-item">
        <span class="info-label">Running Time</span>
        <span class="info-value">{{ runningTime }}</span>
      </div>
      
      <div class="info-item">
        <span class="info-label">Mode</span>
        <span class="info-value">
          <span class="mode-badge" :class="`mode-${mode}`">
            {{ mode === 'manual' ? 'Manual' : 'Auto' }}
          </span>
        </span>
      </div>
      
      <div class="info-item">
        <span class="info-label">Last Command</span>
        <span class="info-value timestamp">{{ lastCommandTime }}</span>
      </div>
    </div>

    <!-- Control Buttons -->
    <div class="control-buttons">
      <button 
        @click="startPump" 
        :disabled="isRunning || loading"
        class="btn-control btn-start"
      >
        <span>{{ loading ? 'Starting...' : isRunning ? 'Pump Running' : 'Start Pump' }}</span>
      </button>
    </div>

    <!-- Auto-Stop Info -->
    <div class="auto-stop-info">
      <span class="info-icon">ℹ️</span>
      <div class="info-content">
        <strong>Automatic Stop:</strong>
        <p>The pump will automatically stop when water level reaches <strong>{{ maxThreshold }}%</strong> or after <strong>10 minutes</strong> of continuous operation (safety limit).</p>
      </div>
    </div>

    <!-- Feedback Messages -->
    <transition name="fade">
      <div v-if="feedbackMessage" :class="['feedback-message', feedbackType]">
        <span class="feedback-icon">{{ feedbackIcon }}</span>
        <span>{{ feedbackMessage }}</span>
      </div>
    </transition>

    <!-- Running Timer (when active) -->
    <div v-if="isRunning" class="running-timer">
      <div class="timer-bar">
        <div class="timer-fill" :style="{ width: timerProgress + '%' }"></div>
      </div>
      <p class="timer-text">
        Pump has been running for {{ runningTime }}. Maximum safe runtime: 10 minutes.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSensorStore } from '@/stores/sensors'

const sensorStore = useSensorStore()

const loading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const startTime = ref(null)
const elapsedSeconds = ref(0)

let timerInterval = null

const isRunning = computed(() => sensorStore.pumpStatus.isRunning)
const mode = computed(() => sensorStore.pumpStatus.mode)
const maxThreshold = computed(() => sensorStore.thresholds.waterLevel.max)

const runningTime = computed(() => {
  if (!isRunning.value) return '0m 0s'
  
  const minutes = Math.floor(elapsedSeconds.value / 60)
  const seconds = elapsedSeconds.value % 60
  return `${minutes}m ${seconds}s`
})

const timerProgress = computed(() => {
  if (!isRunning.value) return 0
  const maxSeconds = 10 * 60 // 10 minutes
  return Math.min((elapsedSeconds.value / maxSeconds) * 100, 100)
})

const lastCommandTime = computed(() => {
  if (!sensorStore.pumpStatus.lastCommand) return 'N/A'
  const date = new Date(sensorStore.pumpStatus.lastCommand)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const feedbackIcon = computed(() => {
  return feedbackType.value === 'success' ? '✅' : '❌'
})

onMounted(() => {
  if (isRunning.value) {
    startTimer()
  }
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

function startTimer() {
  startTime.value = Date.now() - (elapsedSeconds.value * 1000)
  
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
  loading.value = true
  feedbackMessage.value = ''
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    sensorStore.togglePump(true) // true = manual mode
    
    startTimer()
    
    feedbackMessage.value = 'Pump started successfully. It will automatically stop when water reaches ${maxThreshold.value}% or after 10 minutes'
    feedbackType.value = 'success'
    
    setTimeout(() => {
      feedbackMessage.value = ''
    }, 7000)
    
  } catch (error) {
    feedbackMessage.value = 'Failed to start pump. Please try again.'
    feedbackType.value = 'error'
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
  border: 2px solid #3B82F6;
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
  border-color: #2563EB;
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
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.pump-status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #F3F4F6;
  border-radius: 8px;
  border: 2px solid #E5E7EB;
  transition: all 0.3s;
}

.pump-status-indicator.active {
  background: #DCFCE7;
  border-color: #10B981;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9CA3AF;
}

.pump-status-indicator.active .status-dot {
  background: #10B981;
  animation: pulse-status 2s ease-in-out infinite;
}

@keyframes pulse-status {
  0%, 100% {
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
  color: #6B7280;
}

.pump-status-indicator.active .status-text {
  color: #065F46;
}

.safety-warning {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border: 2px solid #F59E0B;
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
  color: #92400E;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.warning-content p {
  color: #78350F;
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
  background: #F9FAFB;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
}

.info-value.text-active {
  color: #10B981;
}

.info-value.timestamp {
  font-size: 0.875rem;
  color: #6B7280;
}

.mode-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.mode-manual {
  background: #FEF3C7;
  color: #92400E;
}

.mode-auto {
  background: #D1FAE5;
  color: #065F46;
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

.btn-icon {
  font-size: 1.25rem;
}

.btn-start {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
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
  background: #D1FAE5;
  color: #065F46;
  border: 2px solid #10B981;
}

.feedback-message.error {
  background: #FEE2E2;
  color: #991B1B;
  border: 2px solid #EF4444;
}

.feedback-icon {
  font-size: 1.25rem;
}

.running-timer {
  padding: 1rem;
  background: #EFF6FF;
  border: 2px solid #3B82F6;
  border-radius: 12px;
}

.timer-bar {
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #F59E0B, #EF4444);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.timer-text {
  font-size: 0.8125rem;
  color: #1E40AF;
  margin: 0;
  text-align: center;
}

.auto-stop-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #DBEAFE;
  border: 2px solid #3B82F6;
  border-radius: 12px;
}

.auto-stop-info .info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  color: #1E40AF;
}

.auto-stop-info .info-content {
  flex: 1;
}

.auto-stop-info .info-content strong {
  display: block;
  color: #1E40AF;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.auto-stop-info .info-content p {
  color: #1E3A8A;
  font-size: 0.8125rem;
  margin: 0;
  line-height: 1.5;
}

.auto-stop-info .info-content p strong {
  display: inline;
  color: #1E40AF;
  font-weight: 700;
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