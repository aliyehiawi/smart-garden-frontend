<template>
  <div id="app">
    <!-- Login Page (No Sidebars) -->
    <div v-if="$route.name === 'login'" class="login-container">
      <RouterView />
    </div>

    <!-- Dashboard Layout (With Sidebars) -->
    <div v-else class="dashboard-layout">
      <Sidebar />
      
      <main class="main-content">
        <div class="top-search">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Search your plants or sensors..." />
          </div>
          <div class="user-profile">
            <span class="user-name">{{ authStore.user?.username }}</span>
            <div class="user-avatar">
              {{ authStore.user?.username?.[0]?.toUpperCase() }}
            </div>
          </div>
        </div>

        <div class="content-wrapper">
          <RouterView />
        </div>
      </main>

      <RightSidebar />
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router' 
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/Sidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f7f4;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}

/* Login Container - Centered */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
}

/* Dashboard Layout - Full Screen with Sidebars */
.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  margin-right: 300px;
  height: 100vh;
  overflow-y: auto;
  background: #f5f7f4;
}

/* Top Search Bar */
.top-search {
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-bar {
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.search-icon {
  font-size: 1.125rem;
  color: #9ca3af;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.9rem;
  color: #111827;
}

.search-bar input::placeholder {
  color: #9ca3af;
}

.user-profile {
  display: flex;
  gap: 1rem;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #111827;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

/* Content Wrapper */
.content-wrapper {
  padding: 2rem;
  min-height: calc(100vh - 80px);
}

/* Responsive */
@media (max-width: 1400px) {
  .main-content {
    margin-right: 0;
  }
  
  .right-sidebar {
    display: none;
  }
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
  }
  
  .sidebar {
    transform: translateX(-100%);
  }
}
</style>
