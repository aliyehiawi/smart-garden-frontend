<template>
  <div id="app">
    <!-- Login Page (Full Screen) -->
    <div v-if="$route.path === '/login'" class="login-wrapper">
      <RouterView />
    </div>

    <!-- Dashboard Layout (with Sidebar) -->
    <div v-else class="dashboard-layout">
      <Sidebar />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()
const authStore = useAuthStore()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #DCECD6;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
}

.login-wrapper {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  margin-left: 80px; 
  height: 100vh;
  overflow-y: auto;
  background: #DCECD6;
  transition: margin-left 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
}

/* Scrollbar Styling */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #E5E7EB;
}

.main-content::-webkit-scrollbar-thumb {
  background: #9CA3AF;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #6B7280;
}

@media (max-width: 2024px) {
  .main-content {
    margin-left: 0;
  }
}
</style>