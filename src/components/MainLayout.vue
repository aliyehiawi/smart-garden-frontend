<template>
  <div class="main-layout">
    <Sidebar />
    
    <div class="main-content">
      <!-- Top Bar with User Info -->
      <div class="top-bar">
        <div class="user-info">
          <span class="user-name">{{ authStore.user?.username }}</span>
          <span class="user-role" :class="roleClass">
            {{ authStore.user?.role }}
          </span>
          <button @click="handleLogout" class="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <!-- Page Content -->
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from './Sidebar.vue'

const router = useRouter()
const authStore = useAuthStore()

const roleClass = computed(() => {
  return authStore.isAdmin ? 'role-admin' : 'role-user'
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-bar {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 600;
  color: #374151;
}

.user-role {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: #DBEAFE;
  color: #1E40AF;
}

.role-user {
  background: #D1FAE5;
  color: #065F46;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #DC2626;
}
</style>