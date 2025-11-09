import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSensorStore = defineStore('sensors', () => {
  // Sensor readings
  const currentReadings = ref({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lastUpdate: null,
  })

  // Historical data for charts
  const historicalData = ref([])

  // Thresholds (configurable by admin)
  const thresholds = ref({
    temperature: { min: 15, max: 30 },
    humidity: { min: 40, max: 80 },
    soilMoisture: { min: 30, max: 70 },
  })

  // Devices/Gardens
  const devices = ref([
    { id: 1, name: 'Garden A - Plot 1', status: 'online', assignedUsers: [2] },
    { id: 2, name: 'Garden A - Plot 2', status: 'online', assignedUsers: [2] },
    { id: 3, name: 'Garden B', status: 'online', assignedUsers: [] },
  ])

  // Pump status
  const pumpStatus = ref({
    isRunning: false,
    lastActivated: null,
    mode: 'auto', // 'auto' or 'manual'
  })

  // Alerts
  const alerts = ref([])

  // Computed: Check if readings are within thresholds
  const hasAlerts = computed(() => {
    const alerts = []
    
    if (currentReadings.value.temperature < thresholds.value.temperature.min) {
      alerts.push('Temperature too low')
    }
    if (currentReadings.value.temperature > thresholds.value.temperature.max) {
      alerts.push('Temperature too high')
    }
    if (currentReadings.value.humidity < thresholds.value.humidity.min) {
      alerts.push('Humidity too low')
    }
    if (currentReadings.value.soilMoisture < thresholds.value.soilMoisture.min) {
      alerts.push('Soil moisture too low - watering needed')
    }
    
    return alerts
  })

  // Actions
  function updateCurrentReadings(data) {
    currentReadings.value = {
      ...data,
      lastUpdate: new Date().toISOString(),
    }
    
    // Add to historical data
    historicalData.value.push({
      timestamp: new Date().toISOString(),
      ...data,
    })
    
    // Keep only last 100 readings
    if (historicalData.value.length > 100) {
      historicalData.value.shift()
    }

    // Check for alerts
    checkAlerts()
  }

  function checkAlerts() {
    const newAlerts = hasAlerts.value
    if (newAlerts.length > 0) {
      alerts.value = newAlerts.map(msg => ({
        message: msg,
        timestamp: new Date().toISOString(),
        severity: 'warning',
      }))
    }
  }

  function updateThresholds(newThresholds) {
    thresholds.value = { ...thresholds.value, ...newThresholds }
  }

  function togglePump(manual = false) {
    pumpStatus.value.isRunning = !pumpStatus.value.isRunning
    pumpStatus.value.lastActivated = new Date().toISOString()
    if (manual) {
      pumpStatus.value.mode = 'manual'
    }
    
    // TODO: Send command to ali (backend/device)
    console.log('Pump status:', pumpStatus.value.isRunning ? 'ON' : 'OFF')
  }

  // Simulate live sensor data (remove this when connecting to real backend)
  function startSimulation() {
    setInterval(() => {
      updateCurrentReadings({
        temperature: (Math.random() * 15 + 18).toFixed(1),
        humidity: (Math.random() * 40 + 40).toFixed(1),
        soilMoisture: (Math.random() * 50 + 25).toFixed(1),
      })
    }, 3000) // Update every 3 seconds
  }

  return {
    currentReadings,
    historicalData,
    thresholds,
    devices,
    pumpStatus,
    alerts,
    hasAlerts,
    updateCurrentReadings,
    updateThresholds,
    togglePump,
    startSimulation,
  }
})
