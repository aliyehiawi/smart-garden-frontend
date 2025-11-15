<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="brand">
        <span class="brand-icon">🌱</span>
        <span class="brand-name">SmartGarden</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <span class="section-label">MAIN</span>
        <router-link to="/" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-text">Dashboard</span>
        </router-link>
        <router-link to="/sensors" class="nav-item">
          <span class="nav-icon">🌡️</span>
          <span class="nav-text">Sensors Overview</span>
        </router-link>
        <router-link to="/plants" class="nav-item">
          <span class="nav-icon">🌿</span>
          <span class="nav-text">Plants</span>
        </router-link>
        <router-link to="/pump" class="nav-item">
          <span class="nav-icon">💧</span>
          <span class="nav-text">Watering System</span>
        </router-link>
        <router-link to="/alerts" class="nav-item">
          <span class="nav-icon">🔔</span>
          <span class="nav-text">Alerts</span>
        </router-link>
      </div>

      <div class="nav-section" v-if="authStore.isAdmin">
        <span class="section-label">ADMIN</span>
        <router-link to="/devices" class="nav-item">
          <span class="nav-icon">🔧</span>
          <span class="nav-text">Devices</span>
        </router-link>
        <router-link to="/users" class="nav-item">
          <span class="nav-icon">👥</span>
          <span class="nav-text">Users</span>
        </router-link>
      </div>

      <div class="nav-section">
        <span class="section-label">YOUR DEVICES</span>
        <div class="device-item">
          <span class="device-status online"></span>
          <span class="device-name">NodeMCU Garden #1</span>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <router-link to="/settings" class="nav-item">
        <span class="nav-icon">⚙️</span>
        <span class="nav-text">Settings</span>
      </router-link>
      <button @click="logout" class="logout-btn">
        <span class="nav-icon">🚪</span>
        <span class="nav-text">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  font-size: 1.75rem;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4caf50;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}

.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
  cursor: pointer;
}

.nav-item:hover {
  background: #f0fdf4;
  color: #4caf50;
}

.nav-item.router-link-active {
  background: #e8f5e9;
  color: #4caf50;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 0.9rem;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.device-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.device-status.online {
  background: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.device-status.offline {
  background: #9ca3af;
}

.device-name {
  font-size: 0.875rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background: #fef2f2;
}
</style>
