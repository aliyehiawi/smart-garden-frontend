<template>
  <div class="plant-card">
    <div class="plant-image">
      <span class="plant-emoji">{{ emoji }}</span>
    </div>
    <div class="plant-info">
      <h4>{{ name }}</h4>
      <p>{{ status }}</p>
    </div>
    <div class="plant-health">
      <div class="health-bar">
        <div class="health-fill" :style="{ width: health + '%' }"></div>
      </div>
      <span class="health-text">{{ health }}% Health</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  emoji: { type: String, default: '🌿' },
  status: { type: String, default: 'Healthy' },
  health: { type: Number, default: 85 }
})
</script>

<style scoped>
.plant-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.plant-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.plant-image {
  width: 80px;
  height: 80px;
  background: #f0fdf4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.plant-emoji {
  font-size: 2.5rem;
}

.plant-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.plant-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.health-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  transition: width 0.5s ease;
}

.health-text {
  font-size: 0.75rem;
  color: #6b7280;
}
</style>