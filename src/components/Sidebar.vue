<template>
  <aside class="sidebar" :class="{ expanded: isExpanded }" @mouseenter="isExpanded = true" @mouseleave="isExpanded = false">
    <!-- Brand Logo -->
    <router-link to="/" title="SmartGarden" class="brand-link">
      <span class="brand-icon">🌱</span>
      <span class="nav-text" v-if="isExpanded">SmartGarden</span>
    </router-link>

    <!-- Navigation Items -->
    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" title="Dashboard">
        <img :src="home" alt="dashboard" class="nav-icon" />
        <span class="nav-text" v-if="isExpanded">Dashboard</span>
      </router-link>

      <router-link to="/charts" class="nav-item" title="Calendar">
        <img :src="calendar" alt="calendar" class="nav-icon" />
        <span class="nav-text" v-if="isExpanded">Calendar</span>
      </router-link>

      <router-link to="/devices" class="nav-item" v-if="authStore.isAdmin" title="Analytics">
        <img :src="barChart" alt="analytics" class="nav-icon" />
        <span class="nav-text" v-if="isExpanded">Analytics</span>
      </router-link>

      <button class="nav-item" title="Time" @click="$router.push('/time')">
        <img :src="clock" alt="time" class="nav-icon" />
        <span class="nav-text" v-if="isExpanded">Time</span>
      </button>

      <router-link to="/users" class="nav-item" v-if="authStore.isAdmin" title="Users">
        <img :src="user" alt="users" class="nav-icon" />
        <span class="nav-text" v-if="isExpanded">Users</span>
      </router-link>

      <button class="nav-item" @click="openSettings" title="Settings">
        <img :src="settings" alt="settings" class="nav-icon" />
        <span class="nav-text" v-if="isExpanded">Settings</span>
      </button>
    </nav>

    <!-- Footer Section -->
    <div class="sidebar-footer">
      <div class="user-avatar" @click="showUserMenu" title="Profile">
        <div class="avatar-letter">{{ getUserInitial() }}</div>
      </div>

      <button class="nav-item add-button" title="Add New" @click="addNew">
        <img :src="post" alt="add" class="nav-icon add-icon" />
        <span class="nav-text" v-if="isExpanded">Add New</span>
      </button>

      <button class="nav-item logout-button" title="Logout" @click="handleLogout">
        <img :src="logout" alt="logout" class="nav-icon add-icon" />
        <span class="nav-text" v-if="isExpanded">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import home from '@/assets/home.png'
import calendar from '@/assets/calendar.png'
import barChart from '@/assets/bar-chart.png'
import clock from '@/assets/clock.png'
import user from '@/assets/user.png'
import settings from '@/assets/settings.png' 
import post from '@/assets/post.png'
import logout from '@/assets/logout.png'

const router = useRouter()
const authStore = useAuthStore()
const isExpanded = ref(false)

function getUserInitial() {
  const username = authStore.user?.username || 'U'
  return username.charAt(0).toUpperCase()
}

function showUserMenu() {
  router.push('/profile')
}

function handleLogout() {
  const confirmed = confirm('Are you sure you want to logout?')
  if (confirmed) {
    authStore.logout()
    router.push('/login')
  }
}

function openSettings() {
  router.push('/settings')
}

function addNew() {
  alert('Add new feature coming soon!')
}
</script>

<style scoped>
.sidebar {
  width: 80px;
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
  width: 240px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 0 16px;
  text-decoration: none;
  color: #16A34A;
  margin-bottom: 24px;
}

.brand-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  overflow-y: auto;
  padding: 0 16px;
  width: 100%;
}

.nav-item {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 12px;
  background: transparent;
  border: none;
  color: #6B7280;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}

.nav-item:hover {
  background: #F3F4F6;
}

.nav-item.router-link-active {
  background: #DCFCE7;
  color: #16A34A;
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: -16px;
  width: 4px;
  height: 24px;
  background: #22C55E;
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  width: 20px;
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
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
  width: 100%;
  padding-left: 16px;
  padding-right: 16px;
}

.user-avatar {
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.08);
}

.avatar-letter {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981, #34D399);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  border: 2px solid #E5E7EB;
}

.add-button {
  background: #DCFCE7 !important;
}

.add-button:hover {
  background: #9df0ba !important;
}

.logout-button {
  background: #FEE2E2 !important;
}

.logout-button:hover {
  background: #FECACA !important;
}

.add-icon {
  width: 20px;
  height: 20px;
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

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.expanded {
    transform: translateX(0);
  }
}
</style>
