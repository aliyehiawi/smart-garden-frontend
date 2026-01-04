<template>
  <aside class="sidebar" :class="{ expanded: isExpanded }" @mouseenter="isExpanded = true" @mouseleave="isExpanded = false">
    <!-- Brand Logo -->
    <div class="brand-link">
      <span class="brand-icon">🌱</span>
      <span class="nav-text" v-if="isExpanded">SmartGarden</span>
    </div>

    <!-- Navigation Items -->
    <nav class="sidebar-nav">
    <!-- Dashboard -->
   <router-link to="/" class="nav-item" active-class="active-route">
    <img :src="home" alt="dashboard" class="nav-icon" />
    <span class="nav-text" v-if="isExpanded">Dashboard</span>
   </router-link>

   <!-- Device Management -->
   <template v-if="authStore.isAdmin">
    <router-link to="/device-management" class="nav-item" active-class="active-route">
      <img :src="device" alt="device-management" class="nav-icon" />
      <span class="nav-text" v-if="isExpanded">Device Management</span>
    </router-link>

    <!-- User Management -->
    <router-link to="/user-management" class="nav-item" active-class="active-route">
      <img :src="user" alt="user-management" class="nav-icon" />
      <span class="nav-text" v-if="isExpanded">User Management</span>
    </router-link>
  </template>
</nav>

    <!-- Footer Section -->
    <div class="sidebar-footer">
      <!-- User Avatar -->
      <div class="user-section" @click="showUserInfo" title="Click for account info">
        <div class="avatar-letter">{{ getUserInitial() }}</div>
        <div class="user-details" v-if="isExpanded">
          <p class="user-name">{{ authStore.user?.username }}</p>
        </div>
      </div>

      <!-- Logout Button -->
      <button class="logout-button" :title="isExpanded ? 'Logout' : 'Logout'" @click="handleLogout">
        <img :src="logout" alt="logout" class="nav-icon" />
        <span class="nav-text" v-if="isExpanded">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import icons
import home from '@/assets/home.png'
import logout from '@/assets/logout.png'
import device from '@/assets/device.png'  
import user from '@/assets/user.png'      

const router = useRouter()
const authStore = useAuthStore()
const isExpanded = ref(false)

const displayName = computed(() => {
  const role = authStore.user?.role
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : ''
})

function getUserInitial() {
  const username = authStore.user?.username || 'U'
  return username.charAt(0).toUpperCase()
}

function showUserInfo() {
  if (authStore.user?.role === 'Admin') {
    // Admin info with controls
    alert(`👤 Admin Account
    
Username: ${authStore.user?.username}
Role: Administrator

📋 Admin Controls Available:
✓ Pump Control
✓ User Management  
✓ Device Registration
✓ Threshold Settings

All controls are available in the Dashboard below.`)
  } else {
    // Regular user info
    alert(`👤 User Account
    
Username: ${authStore.user?.username}
Role: Read-Only User

📋 You have access to:
✓ View Dashboard
✓ View Live Data
✓ View Historical Charts
✓ View Water Level History`)
  }
}

async function handleLogout() {
  const confirmed = confirm('Are you sure you want to logout?')
  if (confirmed) {
    authStore.logout()
    await router.push('/login')
    window.location.reload()
  }
}
</script>

<style scoped>
.sidebar {
  width: 60px;
  height: 100vh;
  background: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  left: 0;
  top: 0;
  padding: 20px 0;
  z-index: 100;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.expanded {
    width: 210px;
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
  }

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0 16px;
  color: #16A34A;
  margin-bottom: 30px;
  font-weight: 700;
  font-size: 18px;
  cursor: default;
}

.brand-icon {
  font-size: 26px;
  flex-shrink: 0;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  overflow-y: auto;
  padding: 0 10px;
  width: 100%;
}

.nav-item {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px;
  border-radius: 12px;
  background: #FFFFFF;
  color: #374151;
  border: 2px solid #E5E7EB;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  white-space: nowrap;
}
.nav-item:hover {
  border-color: #16A34A;
  color: #16A34A;
  transform: translateX(-2px);
}

.nav-item.active-route {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border-color: #10B981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.nav-icon {
  width: 30px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  object-fit: contain;
}

.info-item {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 8px;
  background: #F9FAFB;
  color: #6B7280;
  font-size: 13px;
  white-space: nowrap;
  cursor: default;
}

.role-indicator {
  background: linear-gradient(135deg, #EDE9FE, #DDD6FE);
  color: #6B21A8;
  font-weight: 600;
  margin-top: 8px;
}

.role-indicator.admin {
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  color: #1E40AF;
}

.role-badge {
  font-size: 18px;
}

.section-divider {
  width: 100%;
  margin: 12px 0 8px 0;
  padding: 0 12px;
}

.divider-text {
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-icon {
  width: 30px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar.expanded .nav-text {
  opacity: 1;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 2px;
  border-top: 1px solid #E5E7EB;
  width: 100%;
  padding: 10px;
}

.user-section {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 3px;
  border-radius: 12px;
  background: #FFFFFF;
  color: #374151;
  border: 2px solid #E5E7EB;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  white-space: nowrap;
}

.user-section:hover {
  border-color: #16A34A;
  color: #16A34A;
    transform: translateY(-2px);
}

.avatar-letter {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981, #34D399);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logout-button {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px;
  border-radius: 12px;
  background: #FFFFFF;
  color: #374151;
  border: 2px solid #E5E7EB;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  white-space: nowrap;
}

.logout-button:hover {
  border-color: #EF4444;
  color: #EF4444;
  transform: translateX(2px);
}

/* Scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
  

</style>