import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { waterLevelAPI, wsClient } from '@/utils/api'

export const useSensorsStore = defineStore('sensors', () => {
  // State
  const waterLevelData = ref({}) // Map of deviceId, { content: [], pagination: {} }
  const latestReadings = ref({}) // Map of deviceId, latest sensor reading
  const loading = ref(false)
  const error = ref(null)
  const wsConnected = ref(false)
  const subscriptions = ref({}) // Track active subscriptions

  // Getters
  const isWebSocketConnected = computed(() => wsConnected.value)

  // Actions

  /**
   * Fetch paginated water level data for a device
   * @param {number} deviceId
   * @param {Object} params - { page: 0, size: 20, sort: 'timestamp,desc' }
   */
  async function fetchWaterLevelData(
    deviceId,
    params = { page: 0, size: 20, sort: 'timestamp,desc' },
  ) {
    loading.value = true
    error.value = null

    try {
      const data = await waterLevelAPI.getData(deviceId, params)

      // Store the paginated data
      waterLevelData.value[deviceId] = {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.number || 0,
        pageSize: data.size || 20,
      }

      // Update latest reading if data is available
      if (data.content && data.content.length > 0) {
        latestReadings.value[deviceId] = data.content[0]
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch water level data'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get water level data for a specific device
   * @param {number} deviceId
   */
  function getWaterLevelData(deviceId) {
    return waterLevelData.value[deviceId] || null
  }

  /**
   * Get latest reading for a device
   * @param {number} deviceId
   */
  function getLatestReading(deviceId) {
    return latestReadings.value[deviceId] || null
  }

  /**
   * Update latest reading (for WebSocket updates)
   * @param {number} deviceId
   * @param {Object} reading
   */
  function updateLatestReading(deviceId, reading) {
    // Use object spread to ensure reactivity
    latestReadings.value = {
      ...latestReadings.value,
      [deviceId]: reading,
    }

    // Also prepend to water level data if it exists
    if (waterLevelData.value[deviceId]) {
      const currentData = waterLevelData.value[deviceId]
      currentData.content = [reading, ...currentData.content].slice(0, currentData.pageSize)
      currentData.totalElements++
    }
  }

  // Connect to WebSocket for real-time updates
  function connectWebSocket() {
    if (wsClient.isConnected()) {
      wsConnected.value = true
      return { success: true }
    }

    wsClient.connect(() => {
      wsConnected.value = true
      console.log('WebSocket connected successfully')
    })

    return { success: true }
  }

  /**
   * Subscribe to device updates via WebSocket
   * @param {number} deviceId
   * @param {Object} callbacks onSensorData, onPumpStatus, onThresholdUpdate
   */
  function subscribeToDevice(deviceId, callbacks = {}) {
    if (!wsClient.isConnected()) {
      console.warn('WebSocket not connected, connecting now...')
      connectWebSocket()

      // Wait a bit for connection then subscribe
      setTimeout(() => {
        if (wsClient.isConnected()) {
          performSubscription(deviceId, callbacks)
        }
      }, 1000)
    } else {
      performSubscription(deviceId, callbacks)
    }
  }

  // Perform the actual subscription
  function performSubscription(deviceId, callbacks) {
    const subscriptionId = wsClient.subscribeToDevice(deviceId, (message) => {
      // Handle different message types from WebSocket
      // Backend sends: type: 'sensor_update' / 'pump_status' / 'threshold_updated'
      // Message format: { type: string, deviceId: number, timestamp: string, waterLevel: number, pumpStatus: string }

      if (message.type === 'sensor_update') {
        // Update latest sensor reading
        const sensorData = {
          waterLevel: message.waterLevel,
          timestamp: message.timestamp,
          pumpStatus: message.pumpStatus,
        }

        updateLatestReading(deviceId, sensorData)

        if (callbacks.onSensorData) {
          callbacks.onSensorData(sensorData)
        }

        // Also check if pump status changed and trigger pump status callback
        if (callbacks.onPumpStatus && message.pumpStatus) {
          const transformedStatus = {
            isRunning: message.pumpStatus === 'ON',
            manualControl: false,
            lastUpdate: message.timestamp,
          }
          callbacks.onPumpStatus(transformedStatus)
        }
      } else if (message.type === 'pump_status') {
        // Dedicated pump status message (if backend sends these separately)
        const transformedStatus = {
          isRunning: message.pumpStatus === 'ON',
          manualControl: message.manualControl ?? false,
          lastUpdate: message.timestamp || new Date().toISOString(),
        }

        if (callbacks.onPumpStatus) {
          callbacks.onPumpStatus(transformedStatus)
        }
      } else if (message.type === 'threshold_updated') {
        if (callbacks.onThresholdUpdate) {
          callbacks.onThresholdUpdate(message)
        }
      }
    })

    if (subscriptionId) {
      subscriptions.value[deviceId] = subscriptionId
    }
  }

  /**
   * Unsubscribe from device updates
   * @param {number} deviceId
   */
  function unsubscribeFromDevice(deviceId) {
    const subscriptionId = subscriptions.value[deviceId]
    if (subscriptionId) {
      wsClient.unsubscribe(subscriptionId)
      delete subscriptions.value[deviceId]
    }
  }

  // Disconnect WebSocket
  function disconnectWebSocket() {
    wsClient.disconnect()
    wsConnected.value = false
    subscriptions.value = {}
  }

  // Clear all sensor data
  function clearSensorData() {
    waterLevelData.value = {}
    latestReadings.value = {}
    error.value = null
  }

  /**
   * Remove data for a specific device
   * @param {number} deviceId
   */
  function removeDeviceData(deviceId) {
    delete waterLevelData.value[deviceId]
    delete latestReadings.value[deviceId]
    unsubscribeFromDevice(deviceId)
  }

  return {
    // State
    waterLevelData,
    latestReadings,
    loading,
    error,
    wsConnected,
    subscriptions,

    // Getters
    isWebSocketConnected,

    // Actions
    fetchWaterLevelData,
    getWaterLevelData,
    getLatestReading,
    updateLatestReading,
    connectWebSocket,
    subscribeToDevice,
    unsubscribeFromDevice,
    disconnectWebSocket,
    clearSensorData,
    removeDeviceData,
  }
})
