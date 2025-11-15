<template>
  <div class="dashboard">
    <HeroBanner />

    <!-- Status Cards Grid -->
    <div class="status-grid">
      <StatusCard
        title="Temperature"
        :value="sensorStore.currentReadings.temperature + '°C'"
        label="Current temperature"
        icon="🌡️"
        color="#ef4444"
      />
      <StatusCard
        title="Humidity"
        :value="sensorStore.currentReadings.humidity + '%'"
        label="Air humidity"
        icon="💧"
        color="#3b82f6"
      />
      <StatusCard
        title="Soil Moisture"
        :value="sensorStore.currentReadings.soilMoisture + '%'"
        label="Soil moisture level"
        icon="🌱"
        color="#4caf50"
      />
    </div>

    <!-- Plants Section -->
    <div class="section">
      <div class="section-header">
        <h2>🌿 Your Plants</h2>
        <button class="btn-view-all">View All</button>
      </div>
      <div class="plants-grid">
        <PlantCard
          name="Tomato Plant"
          emoji="🍅"
          status="Needs Water"
          :health="65"
        />
        <PlantCard
          name="Basil"
          emoji="🌿"
          status="Healthy"
          :health="92"
        />
        <PlantCard
          name="Lettuce"
          emoji="🥬"
          status="Healthy"
          :health="88"
        />
        
      </div>
    </div>

    <!-- Automation Rules -->
    <div class="section">
      <AutomationTable />
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <h3>📈 Temperature & Humidity Trend</h3>
        <div class="chart-placeholder">
          <p>Chart visualization coming soon...</p>
        </div>
      </div>
      <div class="chart-card">
        <h3>💧 Soil Moisture History</h3>
        <div class="chart-placeholder">
          <p>Chart visualization coming soon...</p>
        </div>
      </div>
    </div>

    <!-- Last Update -->
    <div class="last-update">
      Last updated: {{ formatDate(sensorStore.currentReadings.lastUpdate) }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue' // ADD computed
import { useAuthStore } from '@/stores/auth' // ADD THIS LINE
import { useSensorStore } from '@/stores/sensors'
import HeroBanner from '@/components/HeroBanner.vue'
import StatusCard from '@/components/StatusCard.vue'
import PlantCard from '@/components/PlantCard.vue'
import AutomationTable from '@/components/AutomationTable.vue'

const authStore = useAuthStore() // ADD THIS LINE
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

let interval = null

onMounted(() => {
  // Start simulation
  sensorStore.startSimulation()
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.btn-view-all {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #4caf50;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-all:hover {
  background: #f0fdf4;
  border-color: #4caf50;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.chart-placeholder {
  height: 250px;
  background: #f9fafb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.last-update {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .plants-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>