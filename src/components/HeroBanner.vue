<template>
  <div class="hero-banner">
    <div class="hero-content">
      <h1>🌱 Welcome to SmartGarden</h1>
      <p>Monitor and control your garden from anywhere</p>
    </div>
    <div class="hero-stats">
      <div class="stat-item">
        <span class="stat-value">24°C</span>
        <span class="stat-label">Temperature</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">65%</span>
        <span class="stat-label">Humidity</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">45%</span>
        <span class="stat-label">Soil Moisture</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// Hero banner logic
</script>

<style scoped>
.hero-banner {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
}

.hero-content h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.hero-content p {
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}
</style>