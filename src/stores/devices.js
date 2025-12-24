import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDeviceStore = defineStore('devices', () => {
  const devices = ref([])

  async function registerDevice(deviceData) {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/devices/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(deviceData)
    // })
    // return await response.json()

    // Mock response
    return {
      deviceId: `DEV-${Date.now()}`,
      deviceKey: `KEY-${Math.random().toString(36).substring(2, 15)}`
    }
  }

  async function sendKeyViaBluetooth(deviceKey) {
    // Bluetooth implementation
    if (!('bluetooth' in navigator)) {
      throw new Error('Bluetooth not supported')
    }

    // TODO: Implement Bluetooth communication with ESP32
  }

  return {
    devices,
    registerDevice,
    sendKeyViaBluetooth
  }
})