<template>
  <div class="dashboard">
    <div class="container">
      <div class="dashboard-header">
        <h1>Garden Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ authStore.user?.username }}</span>
          <span class="badge" :class="authStore.isAdmin ? 'badge-admin' : 'badge-user'">
            {{ authStore.isAdmin ? 'Admin' : 'User' }}
          </span>
        </div>
      </div>

      <!-- Alerts Section -->
      <div v-if="sensorStore.alerts.length > 0" class="alerts-section">
        <div
          v-for="(alert, index) in sensorStore.alerts"
          :key="index"
          class="alert alert-warning"
        >
          <span class="alert-icon">⚠️</span>
          <span>{{ alert.message }}</span>
        </div>
      </div>

      <!-- Sensor Cards -->
      <div class="sensor-grid">
        <SensorCard
          title="Temperature"
          :value="sensorStore.currentReadings.temperature"
          unit="°C"
          icon="🌡️"
          :min="sensorStore.thresholds.temperature.min"
          :max="sensorStore.thresholds.temperature.max"
        />
        
        <SensorCard
          title="Humidity"
          :value="sensorStore.currentReadings.humidity"
          unit="%"
          icon="💧"
          :min="sensorStore.thresholds.humidity.min"
          :max="sensorStore.thresholds.humidity.max"
        />
        
        <SensorCard
          title="Soil Moisture"
          :value="sensorStore.currentReadings.soilMoisture"
          unit="%"
          icon="🌾"
          :min="sensorStore.thresholds.soilMoisture.min"
          :max="sensorStore.thresholds.soilMoisture.max"
        />
        
      </div>

      <!-- Pump Status -->
      <div class="pump-section">
        <div class="card">
          <h2>Pump Status</h2>
          <div class="pump-status">
            <div class="status-indicator" :class="{ active: sensorStore.pumpStatus.isRunning }">
              {{ sensorStore.pumpStatus.isRunning ? 'RUNNING' : 'STOPPED' }}
            </div>
            <div class="pump-info">
              <p>Mode: <strong>{{ sensorStore.pumpStatus.mode }}</strong></p>
              <p v-if="sensorStore.pumpStatus.lastActivated">
                Last activated: {{ formatDate(sensorStore.pumpStatus.lastActivated) }}
              </p>
            </div>
            <button
              v-if="authStore.isAdmin"
              @click="sensorStore.togglePump(true)"
              class="btn-pump"
              :class="{ 'btn-stop': sensorStore.pumpStatus.isRunning }"
            >
              {{ sensorStore.pumpStatus.isRunning ? 'Stop Pump' : 'Start Pump' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Device Status -->
      <div class="devices-section">
        <div class="card">
          <h2>Connected Devices</h2>
          <div class="devices-list">
            <div
              v-for="device in filteredDevices"
              :key="device.id"
              class="device-item"
            >
              <span class="device-name">{{ device.name }}</span>
              <span class="device-status" :class="`status-${device.status}`">
                {{ device.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Last Update -->
      <div class="last-update">
        Last updated: {{ formatDate(sensorStore.currentReadings.lastUpdate) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSensorStore } from '@/stores/sensors'
import SensorCard from '@/components/SensorCard.vue'

const authStore = useAuthStore()
const sensorStore = useSensorStore()

// Filter devices based on user role
const filteredDevices = computed(() => {
  if (authStore.isAdmin) {
    return sensorStore.devices
  }
  // Regular users only see assigned devices
  return sensorStore.devices.filter((device) =>
    device.assignedUsers.includes(authStore.user?.id)
  )
})

function formatDate(dateString) {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleString()
}

onMounted(() => {
  // Start sensor data simulation (remove when connecting to real backend)
  sensorStore.startSimulation()
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  min-height: calc(100vh - 60px);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #333;
}

.user-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
}

.badge-admin {
  background: #667eea;
  color: white;
}

.badge-user {
  background: #48bb78;
  color: white;
}

/* Alerts */
.alerts-section {
  margin-bottom: 2rem;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-warning {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
}

.alert-icon {
  font-size: 1.5rem;
}

/* Sensor Grid */
.sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Card styles */
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

/* Pump Section */
.pump-section {
  margin-bottom: 2rem;
}

.pump-status {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.status-indicator {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: bold;
  background: #e0e0e0;
  color: #666;
}

.status-indicator.active {
  background: #48bb78;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.pump-info {
  flex: 1;
}

.btn-pump {
  padding: 0.75rem 2rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-pump:hover {
  background: #38a169;
}

.btn-stop {
  background: #f56565;
}

.btn-stop:hover {
  background: #e53e3e;
}

/* Devices Section */
.devices-section {
  margin-bottom: 2rem;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.device-name {
  font-weight: 500;
}

.device-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
}

.status-online {
  background: #48bb78;
  color: white;
}

.status-offline {
  background: #f56565;
  color: white;
}

/* Last Update */
.last-update {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .sensor-grid {
    grid-template-columns: 1fr;
  }

  .pump-status {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>