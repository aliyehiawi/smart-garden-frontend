<template>
  <MainLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="title-section">
          <h1>Device Management</h1>
          <p class="subtitle">Register and manage IoT devices</p>
        </div>
      </div>

      <!-- Device Registration Card -->
      <DeviceRegistration @device-registered="handleDeviceRegistered" />

      <!-- Devices List Card -->
      <DeviceList @pump-control-selected="handlePumpControlSelected" />

      <!-- Pump Control Section (shows when device selected) -->
      <div v-if="selectedDeviceId" class="control-section">
        <ManualPumpControl :device-id="selectedDeviceId" />
        <ThresholdControl :device-id="selectedDeviceId" />
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDevicesStore } from '@/stores/devices'
import MainLayout from '@/components/MainLayout.vue'
import DeviceRegistration from '@/components/DeviceRegistration.vue'
import DeviceList from '@/components/DeviceList.vue'
import ManualPumpControl from '@/components/ManualPumpControl.vue'
import ThresholdControl from '@/components/ThresholdControl.vue'

const devicesStore = useDevicesStore()
const { selectedDevice } = storeToRefs(devicesStore)
const selectedDeviceId = ref(null)

async function handleDeviceRegistered() {
  // Reload devices after registration
  await devicesStore.fetchDevices()
  console.log('Device registered')
}

function handlePumpControlSelected(device) {
  if (device) {
    selectedDeviceId.value = device.id
    devicesStore.selectDevice(device.id)
    console.log('Device selected for control:', device.name)
  } else {
    selectedDeviceId.value = null
    console.log('Device deselected')
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #6B7280;
  margin: 0;
  font-size: 1rem;
}

.control-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 1024px) {
  .page-container {
    padding: 1.5rem;
  }
  
  .control-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
}
</style>