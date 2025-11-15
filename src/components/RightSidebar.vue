<template>
  <aside class="right-sidebar">
    <!-- Garden Health Summary -->
    <div class="health-card">
      <h3>🌱 Garden Health Summary</h3>
      <div class="health-circle">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="#e5e7eb"
            stroke-width="12"
          />
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="#4caf50"
            stroke-width="12"
            :stroke-dasharray="`${healthPercentage * 3.77} 377`"
            transform="rotate(-90 70 70)"
            class="health-progress"
          />
        </svg>
        <div class="health-value">
          <span class="percentage">{{ healthPercentage }}%</span>
          <span class="label">Healthy</span>
        </div>
      </div>

      <div class="trend-bars">
        <div class="trend-item">
          <span class="trend-label">💧 Moisture</span>
          <div class="trend-bar">
            <div class="trend-fill" :style="{ width: moistureTrend + '%' }"></div>
          </div>
        </div>
        <div class="trend-item">
          <span class="trend-label">🌡️ Temp</span>
          <div class="trend-bar">
            <div class="trend-fill" :style="{ width: tempTrend + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Connected Devices -->
    <div class="devices-card">
      <h3>Connected Devices</h3>
      <div class="device-list">
        <div class="device">
          <div class="device-info">
            <span class="device-icon">📡</span>
            <div class="device-details">
              <span class="device-title">ESP8266 Garden Unit 1</span>
              <span class="device-subtitle">Online</span>
            </div>
          </div>
          <div class="device-status online"></div>
        </div>

        <div class="device">
          <div class="device-info">
            <span class="device-icon">🌡️</span>
            <div class="device-details">
              <span class="device-title">DHT22 Sensor Pack</span>
              <span class="device-subtitle">Active</span>
            </div>
          </div>
          <div class="device-status online"></div>
        </div>

        <div class="device">
          <div class="device-info">
            <span class="device-icon">💧</span>
            <div class="device-details">
              <span class="device-title">Water Pump</span>
              <span class="device-subtitle">Ready</span>
            </div>
          </div>
          <div class="device-status online"></div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="actions-card">
      <h3>⚡ Quick Actions</h3>
      <button class="action-button water">
        <span class="action-icon">💧</span>
        <span>Water Now</span>
      </button>
      <button class="action-button report">
        <span class="action-icon">📊</span>
        <span>View Report</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSensorStore } from '@/stores/sensors'

const sensorStore = useSensorStore()

const healthPercentage = ref(82)

const moistureTrend = computed(() => {
  return parseFloat(sensorStore.currentReadings.soilMoisture) || 0
})

const lightTrend = computed(() => {
  return (parseFloat(sensorStore.currentReadings.lightLevel) / 10) || 0
})

const tempTrend = computed(() => {
  return (parseFloat(sensorStore.currentReadings.temperature) / 0.4) || 0
})
</script>

<style scoped>
.right-sidebar {
  width: 300px;
  height: 100vh;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  position: fixed;
  right: 0;
  top: 0;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.health-card,
.devices-card,
.actions-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

/* Health Circle */
.health-circle {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.health-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #4caf50;
}

.label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
}

.health-progress {
  transition: stroke-dasharray 1s ease;
}

/* Trend Bars */
.trend-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.trend-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trend-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.trend-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.trend-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  transition: width 0.5s ease;
}

/* Devices List */
.device-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.device-icon {
  font-size: 1.5rem;
}

.device-details {
  display: flex;
  flex-direction: column;
}

.device-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.device-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
}

.device-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.device-status.online {
  background: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

/* Quick Actions */
.action-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

.action-button.water {
  background: #4caf50;
  color: white;
}

.action-button.water:hover {
  background: #43a047;
  transform: translateY(-2px);
}

.action-button.light {
  background: #fbbf24;
  color: white;
}

.action-button.light:hover {
  background: #f59e0b;
  transform: translateY(-2px);
}

.action-button.report {
  background: #3b82f6;
  color: white;
}

.action-button.report:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.25rem;
}
</style>