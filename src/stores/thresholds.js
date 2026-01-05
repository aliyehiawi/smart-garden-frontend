import { defineStore } from 'pinia'
import { ref } from 'vue'
import { thresholdAPI } from '@/utils/api'

export const useThresholdsStore = defineStore('thresholds', () => {
  // State
  const thresholds = ref({}) // Map of deviceId, upperThreshold, lowerThreshold
  const loading = ref(false)
  const error = ref(null)

  // Actions

  /**
   * Fetch thresholds for a device
   * @param {number} deviceId
   */
  async function fetchThresholds(deviceId) {
    loading.value = true
    error.value = null

    try {
      const data = await thresholdAPI.get(deviceId)
      // Use spread operator to trigger Vue reactivity
      thresholds.value = {
        ...thresholds.value,
        [deviceId]: data,
      }
      return { success: true, data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch thresholds'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update thresholds for a device (Admin only)
   * @param {number} deviceId
   * @param {Object} newThresholds upperThreshold, lowerThreshold
   */
  async function updateThresholds(deviceId, newThresholds) {
    loading.value = true
    error.value = null

    try {
      const data = await thresholdAPI.update(deviceId, newThresholds)
      // Use spread operator to trigger Vue reactivity
      thresholds.value = {
        ...thresholds.value,
        [deviceId]: data,
      }
      return { success: true, data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update thresholds'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get thresholds for a specific device
   * @param {number} deviceId
   */
  function getThresholds(deviceId) {
    return thresholds.value[deviceId] || null
  }

  /**
   * Update thresholds in store for WebSocket updates
   * @param {number} deviceId
   * @param {Object} newThresholds
   */
  function setThresholds(deviceId, newThresholds) {
    // Use spread operator to trigger Vue reactivity
    thresholds.value = {
      ...thresholds.value,
      [deviceId]: newThresholds,
    }
  }

  // Clear all thresholds
  function clearThresholds() {
    thresholds.value = {}
    error.value = null
  }

  /**
   * Remove thresholds for a specific device
   * @param {number} deviceId
   */
  function removeDeviceThresholds(deviceId) {
    const { [deviceId]: removed, ...rest } = thresholds.value
    thresholds.value = rest
  }

  return {
    // State
    thresholds,
    loading,
    error,

    // Actions
    fetchThresholds,
    updateThresholds,
    getThresholds,
    setThresholds,
    clearThresholds,
    removeDeviceThresholds,
  }
})
