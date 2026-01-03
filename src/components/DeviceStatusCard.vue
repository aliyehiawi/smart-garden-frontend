<template>
  <div class="kpi-card" :class="`status-${isOnline ? 'online' : 'offline'}`">
    <div class="card-header">
      <div class="icon-wrapper">
        <span class="card-icon">📡</span>
      </div>
      <div class="card-title">Device Status</div>
    </div>
    
    <div class="card-body">
      <div class="main-value">{{ isOnline ? 'Online' : 'Offline' }}</div>
      <div class="device-info">
        <span class="device-name">{{ deviceName }}</span>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="last-seen">
        <span class="icon">🕐</span>
        <span class="text">Last seen: {{ lastSeen }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOnline: {
    type: Boolean,
    required: true
  },
  deviceName: {
    type: String,
  },
  lastSeen: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.status-online {
  border-color: #10B981;
}

.status-offline {
  border-color: #EF4444;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
}

.card-icon {
  font-size: 1.5rem;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-body {
  margin-bottom: 1rem;
}

.main-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1F2937;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.device-name {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #F3F4F6;
  color: #374151;
}

.card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.last-seen {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6B7280;
}

.last-seen .icon {
  font-size: 1rem;
}

.last-seen .text {
  font-weight: 500;
}
</style>