<template>
  <MainLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="title-section">
          <h1>User Management</h1>
          <p class="subtitle">Manage system users and access control</p>
        </div>
      </div>

      <!-- User Registration Card -->
      <UserRegistration @user-registered="handleUserRegistered" />

    <!-- User List -->
      <UserList ref="userListRef" class="user-list-section" />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import MainLayout from '@/components/MainLayout.vue'
import UserRegistration from '@/components/UserRegistration.vue'
import UserList from '@/components/UserList.vue'

const userListRef = ref(null)

// Handle user registration completion
function handleUserRegistered() {
  console.log('New user registered, refreshing user list...')
  
  // Refresh the user list after successful registration
  if (userListRef.value) {
    userListRef.value.fetchUsers()
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  padding: 0; 
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: calc(100vh - 4rem); 
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #6B7280;
  margin: 0;
  font-size: 1rem;
}

.user-list-section {
  margin-top: 1rem;
}

@media (max-width: 1024px) {
  .page-container {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
}
</style>