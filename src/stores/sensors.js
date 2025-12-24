// ============================================================
// TODO: BACKEND API - Replace mock data with real API calls
// ============================================================
// When backend is ready, replace these functions:
// 
// 1. fetchSensorData() - GET /api/devices/:id/current
// 2. updateThresholds() - PUT /api/devices/:id/thresholds
// 3. togglePump() - POST /api/devices/:id/pump/start
// 4. Get history - GET /api/devices/:id/history
//
// Also connect WebSocket: ws://localhost:8080/api/ws
// ============================================================

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSensorStore = defineStore('sensors', () => {
  const currentReadings = ref({
    waterLevel: 0,
    timestamp: null,
    deviceId: null
  })

  const historicalData = ref([])
  const thresholds = ref({
    waterLevel: { min: 20, max: 80 }
  })

  const pumpStatus = ref({
    isRunning: false,
    lastActivated: null,
    mode: 'auto',
    manualControlFlag: false
  })

  function updateCurrentReadings(data) {
    currentReadings.value = {
      waterLevel: data.waterLevel,
      timestamp: new Date().toISOString(),
      deviceId: data.deviceId || 'DEV-001'
    }

    historicalData.value.push({
      ...currentReadings.value,
      min: thresholds.value.waterLevel.min,
      max: thresholds.value.waterLevel.max
    })

    if (historicalData.value.length > 1000) {
      historicalData.value.shift()
    }
  }

  // ============================================================
  // TODO: BACKEND API - Update Thresholds
  // ============================================================
  // Replace with: PUT /api/devices/:id/thresholds
  // Body: { min: number, max: number }
  // ============================================================
  async function updateThresholds(newThresholds) {
    thresholds.value = { ...thresholds.value, ...newThresholds }
    
    // TODO: Call backend API
    /*
    try {
      await api.put('/devices/1/thresholds', {
        min: newThresholds.waterLevel.min,
        max: newThresholds.waterLevel.max
      })
    } catch (error) {
      console.error('Failed to update thresholds:', error)
      throw error
    }
    */
  }

  // ============================================================
  // TODO: BACKEND API - Manual Pump Control
  // ============================================================
  // Replace with: POST /api/devices/:id/pump/start
  // ============================================================
  async function togglePump(manual = false) {
    pumpStatus.value.isRunning = !pumpStatus.value.isRunning
    pumpStatus.value.lastActivated = new Date().toISOString()
    pumpStatus.value.mode = manual ? 'manual' : 'auto'
    pumpStatus.value.manualControlFlag = manual && pumpStatus.value.isRunning

    // TODO: Call backend API
    /*
    try {
      await api.post('/devices/1/pump/start', {
        manual: manual
      })
    } catch (error) {
      console.error('Failed to control pump:', error)
      throw error
    }
    */
  }

  // ============================================================
  // TODO: BACKEND API - Fetch Sensor Data
  // ============================================================
  // Replace with: GET /api/devices/:id/current
  // ============================================================
  async function fetchSensorData() {
    // TODO: Call backend API
    /*
    try {
      const data = await api.get('/devices/1/current')
      updateCurrentReadings(data)
    } catch (error) {
      console.error('Failed to fetch sensor data:', error)
    }
    */
  }

  // MOCK SIMULATION - REMOVE when WebSocket is connected
  function startSimulation() {
    setInterval(() => {
      const waterLevel = Math.floor(Math.random() * (85 - 15) + 15)
      updateCurrentReadings({ waterLevel, deviceId: 'DEV-DEMO' })
    }, 5000)
  }

  return {
    currentReadings,
    historicalData,
    thresholds,
    pumpStatus,
    updateCurrentReadings,
    updateThresholds,
    togglePump,
    fetchSensorData,
    startSimulation
  }
})