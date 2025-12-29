import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deviceAPI, pumpAPI } from '@/utils/api';

export const useDevicesStore = defineStore('devices', () => {
  // State
  const devices = ref([]);
  const selectedDevice = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pumpStatuses = ref({}); // Map of deviceId, pump status

  // Getters
  const deviceCount = computed(() => devices.value.length);
  const hasDevices = computed(() => devices.value.length > 0);
  const selectedDeviceId = computed(() => selectedDevice.value?.id || null);

   // Fetch all devices
  async function fetchDevices() {
    loading.value = true;
    error.value = null;

    try {
      const data = await deviceAPI.getAll();
      devices.value = data;
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch devices';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Register a new device (Admin only)
   * @param {Object} deviceData - { name, location }
   */
  async function registerDevice(deviceData) {
    loading.value = true;
    error.value = null;

    try {
      const newDevice = await deviceAPI.register(deviceData);
      devices.value.push(newDevice);
      return { success: true, device: newDevice };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to register device';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete a device (Admin only)
   * @param {number} deviceId
   */
  async function deleteDevice(deviceId) {
    loading.value = true;
    error.value = null;

    try {
      await deviceAPI.delete(deviceId);
      devices.value = devices.value.filter(d => d.id !== deviceId);
      
      // Clear selected device if it was deleted
      if (selectedDevice.value?.id === deviceId) {
        selectedDevice.value = null;
      }
      
      // Clear pump status
      delete pumpStatuses.value[deviceId];
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete device';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Select a device for detailed view
   * @param {number} deviceId
   */
  function selectDevice(deviceId) {
    const device = devices.value.find(d => d.id === deviceId);
    if (device) {
      selectedDevice.value = device;
      return { success: true };
    }
    return { success: false, error: 'Device not found' };
  }

   // Clear selected device
  function clearSelectedDevice() {
    selectedDevice.value = null;
  }

  /**
   * Get device by ID
   * @param {number} deviceId
   */
  function getDeviceById(deviceId) {
    return devices.value.find(d => d.id === deviceId) || null;
  }

  /**
   * Fetch pump status for a device
   * @param {number} deviceId
   */
  async function fetchPumpStatus(deviceId) {
    try {
      const status = await pumpAPI.getStatus(deviceId);
      pumpStatuses.value[deviceId] = status;
      return { success: true, status };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch pump status';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Start pump manually (Admin only)
   * @param {number} deviceId
   */
  async function startPump(deviceId) {
    try {
      const result = await pumpAPI.start(deviceId);
      
      // Refresh pump status after starting
      await fetchPumpStatus(deviceId);
      
      return { success: true, message: result.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to start pump';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get pump status for a specific device
   * @param {number} deviceId
   */
  function getPumpStatus(deviceId) {
    return pumpStatuses.value[deviceId] || null;
  }

  /**
   * Update device in the list (for WebSocket updates)
   * @param {number} deviceId
   * @param {Object} updates
   */
  function updateDevice(deviceId, updates) {
    const index = devices.value.findIndex(d => d.id === deviceId);
    if (index !== -1) {
      devices.value[index] = { ...devices.value[index], ...updates };
      
      // Update selected device if it's the one being updated
      if (selectedDevice.value?.id === deviceId) {
        selectedDevice.value = { ...selectedDevice.value, ...updates };
      }
    }
  }

  /**
   * Update pump status (for WebSocket updates)
   * @param {number} deviceId
   * @param {Object} status
   */
  function updatePumpStatus(deviceId, status) {
    pumpStatuses.value[deviceId] = status;
  }

  // Clear all data
  function clearDevices() {
    devices.value = [];
    selectedDevice.value = null;
    pumpStatuses.value = {};
    error.value = null;
  }

  return {
    // State
    devices,
    selectedDevice,
    loading,
    error,
    pumpStatuses,
    
    // Getters
    deviceCount,
    hasDevices,
    selectedDeviceId,
    
    // Actions
    fetchDevices,
    registerDevice,
    deleteDevice,
    selectDevice,
    clearSelectedDevice,
    getDeviceById,
    fetchPumpStatus,
    startPump,
    getPumpStatus,
    updateDevice,
    updatePumpStatus,
    clearDevices,
  };
});