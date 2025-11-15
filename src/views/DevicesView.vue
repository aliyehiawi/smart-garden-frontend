<template>
  <div class="devices-view">
    <div class="container">
      <div class="page-header">
        <h1>Device Management</h1>
        <button @click="showAddModal = true" class="btn-primary">
          ➕ Add New Device
        </button>
      </div>

      <!-- Devices List -->
      <div class="devices-grid">
        <div v-for="device in sensorStore.devices" :key="device.id" class="device-card">
          <div class="device-header">
            <div class="device-info">
              <h3>{{ device.name }}</h3>
              <span class="device-status" :class="`status-${device.status}`">
                {{ device.status }}
              </span>
            </div>
            <div class="device-actions">
              <button @click="editDevice(device)" class="btn-icon" title="Edit">
                ✏️
              </button>
              <button @click="toggleDeviceStatus(device)" class="btn-icon" title="Toggle Status">
                {{ device.status === 'online' ? '🔴' : '🟢' }}
              </button>
              <button @click="deleteDevice(device.id)" class="btn-icon btn-danger" title="Delete">
                🗑️
              </button>
            </div>
          </div>

          <div class="device-details">
            <div class="detail-row">
              <span class="detail-label">Device ID:</span>
              <span class="detail-value">{{ device.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Assigned Users:</span>
              <span class="detail-value">
                {{ device.assignedUsers.length > 0 ? device.assignedUsers.join(', ') : 'None' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Last Communication:</span>
              <span class="detail-value">{{ formatLastSeen(device.lastSeen) }}</span>
            </div>
          </div>

          <div class="device-sensors">
            <h4>Current Readings</h4>
            <div class="sensor-readings">
              <div class="reading">
                <span class="reading-icon">🌡️</span>
                <span>{{ sensorStore.currentReadings.temperature }}°C</span>
              </div>
              <div class="reading">
                <span class="reading-icon">💧</span>
                <span>{{ sensorStore.currentReadings.humidity }}%</span>
              </div>
              <div class="reading">
                <span class="reading-icon">🌾</span>
                <span>{{ sensorStore.currentReadings.soilMoisture }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Device Modal -->
      <div v-if="showAddModal || editingDevice" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingDevice ? 'Edit Device' : 'Add New Device' }}</h2>
            <button @click="closeModal" class="btn-close">✕</button>
          </div>

          <form @submit.prevent="saveDevice" class="device-form">
            <div class="form-group">
              <label>Device Name *</label>
              <input
                v-model="deviceForm.name"
                type="text"
                required
                placeholder="e.g., Garden A - Plot 1"
              />
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="deviceForm.status">
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div class="form-group">
              <label>Assigned User IDs (comma-separated)</label>
              <input
                v-model="assignedUsersInput"
                type="text"
                placeholder="e.g., 1,2,3"
              />
              <small>Enter user IDs separated by commas</small>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                {{ editingDevice ? 'Update' : 'Add' }} Device
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSensorStore } from '@/stores/sensors'

const sensorStore = useSensorStore()

const showAddModal = ref(false)
const editingDevice = ref(null)
const deviceForm = ref({
  name: '',
  status: 'online',
  assignedUsers: [],
})
const assignedUsersInput = ref('')

function editDevice(device) {
  editingDevice.value = device
  deviceForm.value = {
    name: device.name,
    status: device.status,
    assignedUsers: [...device.assignedUsers],
  }
  assignedUsersInput.value = device.assignedUsers.join(',')
}

function closeModal() {
  showAddModal.value = false
  editingDevice.value = null
  deviceForm.value = {
    name: '',
    status: 'online',
    assignedUsers: [],
  }
  assignedUsersInput.value = ''
}

function saveDevice() {
  // Parse assigned users
  const assignedUsers = assignedUsersInput.value
    .split(',')
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id))

  if (editingDevice.value) {
    // Update existing device
    const index = sensorStore.devices.findIndex((d) => d.id === editingDevice.value.id)
    if (index !== -1) {
      sensorStore.devices[index] = {
        ...sensorStore.devices[index],
        name: deviceForm.value.name,
        status: deviceForm.value.status,
        assignedUsers,
      }
    }
  } else {
    // Add new device
    const newDevice = {
      id: sensorStore.devices.length + 1,
      name: deviceForm.value.name,
      status: deviceForm.value.status,
      assignedUsers,
      lastSeen: new Date().toISOString(),
    }
    sensorStore.devices.push(newDevice)
  }

  closeModal()
}

function toggleDeviceStatus(device) {
  device.status = device.status === 'online' ? 'offline' : 'online'
}

function deleteDevice(deviceId) {
  if (confirm('Are you sure you want to delete this device?')) {
    const index = sensorStore.devices.findIndex((d) => d.id === deviceId)
    if (index !== -1) {
      sensorStore.devices.splice(index, 1)
    }
  }
}

function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Never'
  const date = new Date(lastSeen)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.devices-view {
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #5568d3;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.device-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.device-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.device-info h3 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.device-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
}

.status-online {
  background: #d4edda;
  color: #155724;
}

.status-offline {
  background: #f8d7da;
  color: #721c24;
}

.device-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 1rem;
}

.btn-icon:hover {
  background: #e0e0e0;
}

.btn-danger:hover {
  background: #f8d7da;
}

.device-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  color: #666;
  font-size: 0.875rem;
}

.detail-value {
  font-weight: 500;
  color: #333;
}

.device-sensors h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: #333;
}

.sensor-readings {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.reading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.875rem;
}

.reading-icon {
  font-size: 1.25rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.device-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group small {
  color: #999;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.form-actions .btn-primary {
  flex: 1;
}

@media (max-width: 768px) {
  .devices-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .devices-grid {
    grid-template-columns: 1fr;
  }
}
</style>