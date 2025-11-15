<template>
  <div class="status-card">
    <div class="status-icon" :style="{ background: color }">
      <span>{{ icon }}</span>
    </div>
    <div class="status-content">
      <h4>{{ title }}</h4>
      <p class="status-value">{{ value }}</p>
      <p class="status-label">{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  label: { type: String, default: '' },
  icon: { type: String, default: '📊' },
  color: { type: String, default: '#4caf50' }
})
</script>

<style scoped>
.status-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.status-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.status-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.status-label {
  font-size: 0.75rem;
  color: #6b7280;
}
</style>