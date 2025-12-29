import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { waterLevelAPI, wsClient } from '@/utils/api';

export const useSensorsStore = defineStore('sensors', () => {
  // State
  const waterLevelData = ref({}); // Map of deviceId, { content: [], pagination: {} }
  const latestReadings = ref({}); // Map of deviceId, latest sensor reading
  const loading = ref(false);
  const error = ref(null);
  const wsConnected = ref(false);
  const subscriptions = ref({}); // Track active subscriptions

  // Getters
  const isWebSocketConnected = computed(() => wsConnected.value);

  // Actions

  /**
   * Fetch paginated water level data for a device
   * @param {number} deviceId
   * @param {Object} params - { page: 0, size: 20, sort: 'timestamp,desc' }
   */
  async function fetchWaterLevelData(deviceId, params = { page: 0, size: 20, sort: 'timestamp,desc' }) {
    loading.value = true;
    error.value = null;

    try {
      const data = await waterLevelAPI.getData(deviceId, params);
      
      // Store the paginated data
      waterLevelData.value[deviceId] = {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.number || 0,
        pageSize: data.size || 20,
      };

      // Update latest reading if data is available
      if (data.content && data.content.length > 0) {
        latestReadings.value[deviceId] = data.content[0];
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch water level data';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get water level data for a specific device
   * @param {number} deviceId
   */
  function getWaterLevelData(deviceId) {
    return waterLevelData.value[deviceId] || null;
  }

  /**
   * Get latest reading for a device
   * @param {number} deviceId
   */
  function getLatestReading(deviceId) {
    return latestReadings.value[deviceId] || null;
  }

  /**
   * Update latest reading (for WebSocket updates)
   * @param {number} deviceId
   * @param {Object} reading
   */
  function updateLatestReading(deviceId, reading) {
    latestReadings.value[deviceId] = reading;
    
    // Also prepend to water level data if it exists
    if (waterLevelData.value[deviceId]) {
      const currentData = waterLevelData.value[deviceId];
      currentData.content = [reading, ...currentData.content].slice(0, currentData.pageSize);
      currentData.totalElements++;
    }
  }

  // Connect to WebSocket for real-time updates
  function connectWebSocket() {
    if (wsClient.isConnected()) {
      wsConnected.value = true;
      return { success: true };
    }

    wsClient.connect(() => {
      wsConnected.value = true;
      console.log('WebSocket connected successfully');
    });

    return { success: true };
  }

  /**
   * Subscribe to device updates via WebSocket
   * @param {number} deviceId
   * @param {Object} callbacks onSensorData, onPumpStatus, onThresholdUpdate 
   */
  function subscribeToDevice(deviceId, callbacks = {}) {
    if (!wsClient.isConnected()) {
      console.warn('WebSocket not connected, connecting now...');
      connectWebSocket();
      
      // Wait a bit for connection then subscribe
      setTimeout(() => {
        if (wsClient.isConnected()) {
          performSubscription(deviceId, callbacks);
        }
      }, 1000);
    } else {
      performSubscription(deviceId, callbacks);
    }
  }

  // Perform the actual subscription
  function performSubscription(deviceId, callbacks) {
    const subscriptionId = wsClient.subscribeToDevice(deviceId, (message) => {
      // Handle different message types from WebSocket
      // Backend sends: type: 'SENSOR_DATA' / 'PUMP_STATUS' / 'THRESHOLD_UPDATE', data: {...} 
      
      if (message.type === 'SENSOR_DATA') {
        updateLatestReading(deviceId, message.data);
        if (callbacks.onSensorData) {
          callbacks.onSensorData(message.data);
        }
      } else if (message.type === 'PUMP_STATUS') {
        if (callbacks.onPumpStatus) {
          callbacks.onPumpStatus(message.data);
        }
      } else if (message.type === 'THRESHOLD_UPDATE') {
        if (callbacks.onThresholdUpdate) {
          callbacks.onThresholdUpdate(message.data);
        }
      }
    });

    if (subscriptionId) {
      subscriptions.value[deviceId] = subscriptionId;
    }
  }

  /**
   * Unsubscribe from device updates
   * @param {number} deviceId
   */
  function unsubscribeFromDevice(deviceId) {
    const subscriptionId = subscriptions.value[deviceId];
    if (subscriptionId) {
      wsClient.unsubscribe(subscriptionId);
      delete subscriptions.value[deviceId];
    }
  }

  // Disconnect WebSocket
  function disconnectWebSocket() {
    wsClient.disconnect();
    wsConnected.value = false;
    subscriptions.value = {};
  }

  // Clear all sensor data
  function clearSensorData() {
    waterLevelData.value = {};
    latestReadings.value = {};
    error.value = null;
  }

  /**
   * Remove data for a specific device
   * @param {number} deviceId
   */
  function removeDeviceData(deviceId) {
    delete waterLevelData.value[deviceId];
    delete latestReadings.value[deviceId];
    unsubscribeFromDevice(deviceId);
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
  };
});