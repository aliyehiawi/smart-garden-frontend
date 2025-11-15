<template>
  <div class="pump-control-view">
    <div class="container">
      <h1>Advanced Pump Control</h1>

      <div class="control-grid">
        <!-- Current Status -->
        <div class="card status-card">
          <h2>Current Status</h2>
          <div class="pump-status-display">
            <div class="status-circle" :class="{ active: sensorStore.pumpStatus.isRunning }">
              <span class="status-icon">💧</span>
            </div>
            <div class="status-text">
              <h3>{{ sensorStore.pumpStatus.isRunning ? 'RUNNING' : 'STOPPED' }}</h3>
              <p>Mode: {{ sensorStore.pumpStatus.mode }}</p>
            </div>
          </div>

          <div class="control-buttons">
            <button
              @click="sensorStore.togglePump(true)"
              class="btn-control"
              :class="sensorStore.pumpStatus.isRunning ? 'btn-stop' : 'btn-start'"
            >
              {{ sensorStore.pumpStatus.isRunning ? 'Stop Pump' : 'Start Pump' }}
            </button>
          </div>

          <div class="status-info">
            <div class="info-item">
              <span class="info-label">Last Activated:</span>
              <span class="info-value">
                {{ formatDate(sensorStore.pumpStatus.lastActivated) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Runtime Today:</span>
              <span class="info-value">{{ totalRuntimeToday }} minutes</span>
            </div>
          </div>
        </div>

        <!-- Automatic Control Settings -->
        <div class="card">
          <h2>Automatic Control</h2>
          <form @submit.prevent="saveAutoSettings">
            <div class="form-group">
              <label>
                <input
                  v-model="autoSettings.enabled"
                  type="checkbox"
                />
                Enable Automatic Control
              </label>
            </div>

            <div v-if="autoSettings.enabled" class="auto-settings">
              <div class="form-group">
                <label>Soil Moisture Threshold (%)</label>
                <input
                  v-model.number="autoSettings.soilMoistureThreshold"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                />
                <small>Start pump when soil moisture drops below this value</small>
              </div>

              <div class="form-group">
                <label>Max Runtime per Cycle (minutes)</label>
                <input
                  v-model.number="autoSettings.maxRuntime"
                  type="number"
                  min="1"
                  max="60"
                />
              </div>

              <div class="form-group">
                <label>Cooldown Period (minutes)</label>
                <input
                  v-model.number="autoSettings.cooldown"
                  type="number"
                  min="5"
                  max="120"
                />
                <small>Minimum time between automatic activations</small>
              </div>

              <button type="submit" class="btn-primary">
                Save Settings
              </button>
            </div>
          </form>
        </div>

        <!-- Schedule Control -->
        <div class="card">
          <h2>Scheduled Watering</h2>
          <button @click="showScheduleModal = true" class="btn-primary">
            ➕ Add Schedule
          </button>

          <div class="schedules-list">
            <div
              v-for="schedule in schedules"
              :key="schedule.id"
              class="schedule-item"
            >
              <div class="schedule-info">
                <span class="schedule-time">🕐 {{ schedule.time }}</span>
                <span class="schedule-duration">{{ schedule.duration }} min</span>
                <span class="schedule-days">{{ formatDays(schedule.days) }}</span>
              </div>
              <div class="schedule-actions">
                <label class="switch">
                  <input
                    v-model="schedule.enabled"
                    type="checkbox"
                  />
                  <span class="slider"></span>
                </label>
                <button
                  @click="deleteSchedule(schedule.id)"
                  class="btn-icon btn-danger"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div v-if="schedules.length === 0" class="no-schedules">
              No schedules configured
            </div>
          </div>
        </div>

        <!-- Thresholds Configuration -->
        <div class="card">
          <h2>Sensor Thresholds</h2>
          <form @submit.prevent="saveThresholds">
            <div class="threshold-group">
              <h3>🌡️ Temperature</h3>
              <div class="range-inputs">
                <div class="form-group">
                  <label>Min (°C)</label>
                  <input
                    v-model.number="thresholdsForm.temperature.min"
                    type="number"
                    step="0.5"
                  />
                </div>
                <div class="form-group">
                  <label>Max (°C)</label>
                  <input
                    v-model.number="thresholdsForm.temperature.max"
                    type="number"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            <div class="threshold-group">
              <h3>💧 Humidity</h3>
              <div class="range-inputs">
                <div class="form-group">
                  <label>Min (%)</label>
                  <input
                    v-model.number="thresholdsForm.humidity.min"
                    type="number"
                  />
                </div>
                <div class="form-group">
                  <label>Max (%)</label>
                  <input
                    v-model.number="thresholdsForm.humidity.max"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div class="threshold-group">
              <h3>🌾 Soil Moisture</h3>
              <div class="range-inputs">
                <div class="form-group">
                  <label>Min (%)</label>
                  <input
                    v-model.number="thresholdsForm.soilMoisture.min"
                    type="number"
                  />
                </div>
                <div class="form-group">
                  <label>Max (%)</label>
                  <input
                    v-model.number="thresholdsForm.soilMoisture.max"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <button type="submit" class="btn-primary">
              Update Thresholds
            </button>
          </form>
        </div>

        <!-- Activity Log -->
        <div class="card activity-log">
          <h2>Recent Activity</h2>
          <div class="log-list">
            <div
              v-for="log in activityLogs"
              :key="log.id"
              class="log-item"
              :class="`log-${log.type}`"
            >
              <span class="log-icon">{{ getLogIcon(log.type) }}</span>
              <div class="log-content">
                <p class="log-message">{{ log.message }}</p>
                <span class="log-time">{{ formatDate(log.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Modal -->
      <div v-if="showScheduleModal" class="modal-overlay" @click="closeScheduleModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Add Watering Schedule</h2>
            <button @click="closeScheduleModal" class="btn-close">✕</button>
          </div>

          <form @submit.prevent="addSchedule" class="schedule-form">
            <div class="form-group">
              <label>Time</label>
              <input
                v-model="scheduleForm.time"
                type="time"
                required
              />
            </div>

            <div class="form-group">
              <label>Duration (minutes)</label>
              <input
                v-model.number="scheduleForm.duration"
                type="number"
                min="1"
                max="60"
                required
              />
            </div>

            <div class="form-group">
              <label>Days</label>
              <div class="days-selector">
                <label
                  v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
                  :key="day"
                  class="day-option"
                >
                  <input
                    v-model="scheduleForm.days"
                    type="checkbox"
                    :value="day"
                  />
                  {{ day }}
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeScheduleModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Add Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSensorStore } from '@/stores/sensors'

const sensorStore = useSensorStore()

const autoSettings = reactive({
  enabled: false,
  soilMoistureThreshold: 30,
  maxRuntime: 15,
  cooldown: 30,
})

const schedules = ref([
  { id: 1, time: '06:00', duration: 10, days: ['Mon', 'Wed', 'Fri'], enabled: true },
  { id: 2, time: '18:00', duration: 15, days: ['Tue', 'Thu', 'Sat'], enabled: true },
])

const showScheduleModal = ref(false)
const scheduleForm = reactive({ time: '06:00', duration: 10, days: [] })

const thresholdsForm = reactive({
  temperature: { ...sensorStore.thresholds.temperature },
  humidity: { ...sensorStore.thresholds.humidity },
  soilMoisture: { ...sensorStore.thresholds.soilMoisture },
})

const activityLogs = ref([
  { id: 1, type: 'start', message: 'Pump started manually by Admin', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, type: 'stop', message: 'Pump stopped after 15 minutes', timestamp: new Date(Date.now() - 2700000).toISOString() },
  { id: 3, type: 'auto', message: 'Auto-watering triggered (soil moisture < 30%)', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, type: 'schedule', message: 'Scheduled watering at 06:00 completed', timestamp: new Date(Date.now() - 10800000).toISOString() },
])

const totalRuntimeToday = ref(45)

function saveAutoSettings() {
  console.log('Auto settings saved:', autoSettings)
  alert('Automatic control settings saved!')
}

function saveThresholds() {
  sensorStore.updateThresholds(thresholdsForm)
  alert('Thresholds updated successfully!')
}

function addSchedule() {
  schedules.value.push({ id: schedules.value.length + 1, ...scheduleForm, enabled: true })
  closeScheduleModal()
}

function deleteSchedule(id) {
  if (confirm('Delete this schedule?')) {
    schedules.value = schedules.value.filter((s) => s.id !== id)
  }
}

function closeScheduleModal() {
  showScheduleModal.value = false
  scheduleForm.time = '06:00'
  scheduleForm.duration = 10
  scheduleForm.days = []
}

function formatDays(days) {
  if (days.length === 7) return 'Every day'
  if (days.length === 0) return 'No days selected'
  return days.join(', ')
}

function getLogIcon(type) {
  const icons = { start: '▶️', stop: '⏸️', auto: '🤖', schedule: '📅', error: '❌' }
  return icons[type] || '📝'
}

function formatDate(dateString) {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}
</script>

<style scoped>
.pump-control-view {
  padding: 2rem;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.container h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
}

.status-card {
  grid-column: span 2;
}

.pump-status-display {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.status-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.status-circle.active {
  background: #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
}

.status-icon {
  font-size: 3rem;
}

.status-text h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.control-buttons {
  margin-bottom: 1.5rem;
}

.btn-control {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start {
  background: #4caf50;
  color: white;
}

.btn-stop {
  background: #f44336;
  color: white;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input[type="number"],
.form-group input[type="time"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.form-group small {
  color: #666;
  font-size: 0.875rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.auto-settings {
  padding-top: 1rem;
}

.schedules-list {
  margin-top: 1rem;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.schedule-info {
  display: flex;
  gap: 1rem;
}

.schedule-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4caf50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.threshold-group {
  margin-bottom: 1.5rem;
}

.threshold-group h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.range-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.activity-log {
  grid-column: span 2;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.log-icon {
  font-size: 1.5rem;
}

.log-content {
  flex: 1;
}

.log-message {
  margin-bottom: 0.25rem;
}

.log-time {
  font-size: 0.75rem;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.days-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.day-option {
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem;
  background: #e0e0e0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .control-grid {
    grid-template-columns: 1fr;
  }
  
  .status-card,
  .activity-log {
    grid-column: span 1;
  }
}
</style>
