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
      <div class="page-content-wrapper">
        <slot />
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
      <div class="modal-content" @click.stop>
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to logout?</p>
        <div class="modal-actions">
          <button @click="showLogoutModal = false" class="btn-cancel">
            Cancel
          </button>
          <button @click="confirmLogout" class="btn-confirm">
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from './Sidebar.vue'

const router = useRouter()
const authStore = useAuthStore()
const showLogoutModal = ref(false)

const roleClass = computed(() => {
  return authStore.isAdmin ? 'role-admin' : 'role-user'
})

function handleLogout() {
  showLogoutModal.value = true
}

function confirmLogout() {
  showLogoutModal.value = false
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

/* Custom Logout Modal */
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
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #1F2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-content p {
  margin: 0 0 1.5rem 0;
  color: #6B7280;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  background: #F3F4F6;
  color: #374151;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #E5E7EB;
}

.btn-confirm {
  padding: 0.625rem 1.25rem;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-confirm:hover {
  background: #DC2626;
}

.page-content-wrapper {
  flex: 1;
  width: 100%;
  padding: 2rem 3rem;
  overflow-y: auto;
  background: #F9FAFB;
}

.page-content-wrapper > .dashboard-container,
.page-content-wrapper > .page-container {
  padding: 0;
}

@media (max-width: 1024px) {
  .page-content-wrapper {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .page-content-wrapper {
    padding: 1rem;
  }
}
</style>