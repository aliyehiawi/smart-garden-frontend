<template>
  <div class="dashboard">
    <!-- Garden Hero Section -->
    <div class="garden-hero">
        <!-- Background Image (uses asset file) -->
        <div class="garden-background" :style="gardenBgStyle">
          <div class="garden-overlay"></div>
        </div>

      <!-- Hero Content -->
      <div class="hero-content">
        <!-- Header -->
        <div class="hero-header">
          <div class="greeting">
            <h1>Morning, {{ authStore.user?.username || 'Guest' }}!</h1>
            <p>Here's today's update from your smart garden</p>
          </div>
          <div class="hero-actions">
            <button class="btn-contact">
              <span>📞</span> Contact support
            </button>
            <button class="btn-sync">
              <span>🔄</span> Sync latest data
            </button>
          </div>
        </div>

        <!-- Floating Sensor Card -->
        <div class="sensor-card-float">
          <div class="sensor-header">
            <span class="sensor-id">TO103</span>
            <span class="sensor-indicator"></span>
          </div>
          <div class="sensor-data">
            <div class="sensor-row">
              <span class="label">Soil temp</span>
              <span class="value">{{ sensorStore.currentReadings.temperature }}°C</span>
            </div>
            <div class="sensor-row">
              <span class="label">Air quality index</span>
              <span class="value">38 <span class="status-good">(Good)</span></span>
            </div>
          </div>
          <div class="solar-panel">
            <div class="panel-grid">
              <div class="panel-cell" v-for="i in 16" :key="i"></div>
            </div>
          </div>
        </div>

        <!-- Time Filter Tabs -->
        <div class="time-filters">
          <button 
            v-for="filter in timeFilters" 
            :key="filter"
            :class="['filter-btn', { active: selectedFilter === filter }]"
            @click="selectedFilter = filter"
          >
            {{ filter }}
          </button>
          
          <div class="filter-actions">
            <button class="btn-action">
              <span>📅</span> Select dates
            </button>
            <button class="btn-action">
              <span>⚙️</span> Adjust thresholds
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Metric Cards Grid -->
    <div class="metrics-container">
      <div class="metrics-grid">
        <!-- Card 1: Field Temperature -->
        <div class="metric-card yellow">
          <div class="card-icon">🌡️</div>
          <div class="card-content">
            <h4>Field temperature</h4>
            <div class="card-value">{{ sensorStore.currentReadings.temperature }}°C <span class="unit">Avg</span></div>
            <p class="card-note">Perfect for tomatoes and leafy greens.</p>
          </div>
        </div>

        <!-- Card 2: Soil Moisture -->
        <div class="metric-card purple">
          <div class="card-icon">💧</div>
          <div class="card-content">
            <h4>Soil moisture</h4>
            <div class="card-value">
              {{ sensorStore.currentReadings.soilMoisture }}%
              <span class="badge badge-warning">⚠ Slightly dry</span>
            </div>
            <p class="card-note">Current level is slightly dry for leafy crops.</p>
          </div>
        </div>

        <!-- Card 3: Water Used -->
        <div class="metric-card green">
          <div class="card-icon">💧</div>
          <div class="card-content">
            <h4>Water used</h4>
            <div class="progress-label">72% of weekly limit</div>
            <div class="progress-bar">
              <div class="progress-fill blue-gradient" style="width: 72%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="bottom-container">
      <div class="bottom-grid">
        <!-- Active Devices Card -->
        <div class="devices-card">
          <h3>Active devices</h3>
          <p class="subtitle">You're using 80% of your tracking capacity</p>
          
          <div class="circular-chart">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle 
                cx="90" cy="90" r="70" 
                fill="none" 
                stroke="#E5E7EB" 
                stroke-width="20"
              />
              <circle 
                cx="90" cy="90" r="70" 
                fill="none" 
                stroke="#10B981" 
                stroke-width="20"
                stroke-dasharray="439.6"
                stroke-dashoffset="87.92"
                transform="rotate(-90 90 90)"
                stroke-linecap="round"
                class="progress-circle"
              />
            </svg>
            <div class="chart-center">
              <span class="chart-value">320</span>
              <span class="chart-change">+10%</span>
            </div>
          </div>

          <div class="avatar-section">
            <div class="user-avatar-circle">
              {{ getUserInitial() }}
            </div>
          </div>
        </div>

        <!-- Sensor Trends Card -->
        <div class="trends-card">
          <div class="trends-header">
            <h3>Sensor data trends</h3>
            <button class="btn-analytics" @click="$router.push('/charts')">
              Open detailed analytics →
            </button>
          </div>

          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot blue"></span> Soil sensors reporting
            </span>
            <span class="legend-item">
              <span class="legend-dot teal"></span> Air quality sensors
            </span>
            <span class="legend-item">
              <span class="legend-dot purple"></span> Weather sensors
            </span>
          </div>

          <div class="chart-area">
            <ChartCard
              v-if="chartData.length > 0"
              title=""
              :data="chartData"
              color="#3B82F6"
              unit="°C"
              icon=""
            />
            <div v-else class="no-data">
              <p>Collecting sensor data...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSensorStore } from '@/stores/sensors'
import ChartCard from '@/components/ChartCard.vue'
import gardenBg from '@/assets/garden-bg.png'

const authStore = useAuthStore()
const sensorStore = useSensorStore()

const timeFilters = ['Today', '7 days', '30 days', '3 months']
const selectedFilter = ref('Today')

const chartData = computed(() => {
  return sensorStore.historicalData.slice(-20).map(reading => ({
    timestamp: reading.timestamp,
    value: parseFloat(reading.temperature)
  }))
})

function getUserInitial() {
  const username = authStore.user?.username || 'U'
  return username.charAt(0).toUpperCase()
}

onMounted(() => {
  sensorStore.startSimulation()
})

// style binding for background image (bundled by Vite)
const gardenBgStyle = {
  backgroundImage: `url(${gardenBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}
</script>

<style scoped>
.dashboard {
  width: 1440px; /* fixed dashboard canvas */
  height: 1024px; /* fixed dashboard height */
  background: linear-gradient(to bottom, #DCECD6, #E8F5E9);
  margin: 20px auto; /* center inside main-content */
  border-radius: 18px; /* rounded window edges */
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.06);
}

/* Garden Hero Section */
.garden-hero {
  position: relative;
  height: 450px;
  overflow: hidden;
  border-radius: 0 0 24px 24px;
}

.garden-background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.garden-illustration {
  width: 100%;
  height: 100%;
  position: relative;
}

.garden-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.95) saturate(1.1);
}

.garden-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(220, 236, 214, 0.7), rgba(167, 243, 208, 0.5));
}

.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.greeting h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.greeting p {
  font-size: 15px;
  color: #6B7280;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.btn-contact,
.btn-sync {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-contact {
  background: #FFFFFF;
  color: #374151;
  border: 1px solid #E5E7EB;
}

.btn-contact:hover {
  background: #F9FAFB;
}

.btn-sync {
  background: #10B981;
  color: white;
}

.btn-sync:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* Floating Sensor Card */
.sensor-card-float {
  position: absolute;
  top: 110px;
  right: 60px;
  width: 260px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.sensor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sensor-id {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
}

.sensor-indicator {
  width: 12px;
  height: 12px;
  background: #10B981;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.sensor-data {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.sensor-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.sensor-row .label {
  color: #6B7280;
}

.sensor-row .value {
  font-weight: 600;
  color: #1F2937;
}

.status-good {
  color: #10B981;
  font-size: 12px;
}

.solar-panel {
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  background: #4A5568;
  padding: 6px;
  border-radius: 8px;
}

.panel-cell {
  aspect-ratio: 1;
  background: #667EEA;
  border-radius: 2px;
}

/* Time Filters */
.time-filters {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background: white;
  color: #6B7280;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #1F2937;
  color: white;
}

.filter-btn:hover:not(.active) {
  background: #F3F4F6;
}

.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

.btn-action {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
  background: white;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

/* Metrics Container */
.metrics-container {
  padding: 24px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.metric-card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition: transform 0.2s;
  min-height: 140px;
}

.metric-card:hover {
  transform: translateY(-4px);
}

.metric-card.yellow { background: #FEF3C7; }
.metric-card.blue { background: #DBEAFE; }
.metric-card.purple { background: #EDE9FE; }
.metric-card.green { background: #D1FAE5; }
.metric-card.peach { background: #FFF7ED; }
.metric-card.lavender { background: #F3E8FF; }
.metric-card.orange { background: #FFEDD5; }

.card-icon {
  font-size: 32px;
  flex-shrink: 0;
  line-height: 1;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-value .unit {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
}

.badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.badge-clean {
  background: #D1FAE5;
  color: #065F46;
}

.badge-warning {
  background: #FEF3C7;
  color: #92400E;
}

.card-note {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.4;
}

.progress-label {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.blue-gradient { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
.purple-gradient { background: linear-gradient(90deg, #8B5CF6, #A78BFA); }
.pink-gradient { background: linear-gradient(90deg, #EC4899, #F472B6); }
.orange-gradient { background: linear-gradient(90deg, #F59E0B, #FBBF24); }

/* Bottom Section */
.bottom-container {
  padding: 0 24px 24px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
}

.devices-card,
.trends-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.devices-card h3,
.trends-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 24px;
}

.circular-chart {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 24px;
}

.progress-circle {
  transition: stroke-dashoffset 1s ease;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.chart-value {
  display: block;
  font-size: 48px;
  font-weight: 700;
  color: #1F2937;
  line-height: 1;
}

.chart-change {
  display: block;
  font-size: 16px;
  color: #10B981;
  font-weight: 600;
  margin-top: 4px;
}

.avatar-section {
  text-align: center;
}

.user-avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981, #34D399);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  border: 3px solid #E5E7EB;
}

.trends-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-analytics {
  background: none;
  border: none;
  color: #3B82F6;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s;
}

.btn-analytics:hover {
  color: #2563EB;
}

.chart-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 13px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.blue { background: #3B82F6; }
.legend-dot.teal { background: #14B8A6; }
.legend-dot.purple { background: #8B5CF6; }

.chart-area {
  height: 220px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9CA3AF;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .sensor-card-float {
    position: static;
    margin: 24px auto 0;
    max-width: 300px;
  }
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .bottom-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .time-filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-actions {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .garden-hero {
    height: auto;
    min-height: 400px;
  }
  
  .hero-content {
    padding: 20px;
  }
}
</style>