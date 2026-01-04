<template>
  <div class="user-list-card">
    <!-- Header -->
    <div class="card-header">
      <div class="header-info">
        <h3>User Management</h3>
        <p class="subtitle">
          {{ users.length }} user{{ users.length !== 1 ? 's' : '' }} registered
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <!-- User Table -->
    <div v-else-if="filteredUsers.length > 0" class="table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <td>
              <div class="user-info">
                <div class="user-avatar">
                </div>
                <span class="username">{{ user.username }}</span>
              </div>
            </td>
            <td class="email">{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="`role-${user.role.toLowerCase()}`">
                <span class="role-icon">{{ user.role === 'ADMIN' ? '🛡️' : '👤' }}</span>
                {{ user.role === 'ADMIN' ? 'Admin' : 'User' }}
              </span>
            </td>
            <td class="date">{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  @click="openEditModal(user)"
                  class="action-btn edit-btn"
                  title="Edit role"
                >
                 Edit
                </button>
                <button
                  @click="openDeleteModal(user)"
                  class="action-btn delete-btn"
                  title="Delete user"
                >
                 Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Role Modal -->
    <transition name="modal">
      <div v-if="editingUser" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">Edit User Role</h3>

          <div class="modal-body">
            <div class="user-details">
              <div class="user-avatar large">
              </div>
              <div>
                <p class="user-name">{{ editingUser.username }}</p>
                <p class="user-email">{{ editingUser.email }}</p>
              </div>
            </div>

            <div class="role-change-display">
              <p class="role-label">Role Change</p>
              <div class="role-flow">
                <span class="role-badge" :class="`role-${editingUser.role.toLowerCase()}`">
                  <span class="role-icon">{{ editingUser.role === 'ADMIN' ? '🛡️' : '👤' }}</span>
                  {{ editingUser.role === 'ADMIN' ? 'Admin' : 'User' }}
                </span>
                <span class="arrow">→</span>
                <span class="role-badge" :class="`role-${getNewRole(editingUser.role).toLowerCase()}`">
                  <span class="role-icon">{{ getNewRole(editingUser.role) === 'ADMIN' ? '🛡️' : '👤' }}</span>
                  {{ getNewRole(editingUser.role) === 'ADMIN' ? 'Admin' : 'User' }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeEditModal" :disabled="actionLoading" class="btn-secondary">
              Cancel
            </button>
            <button @click="handleRoleToggle" :disabled="actionLoading" class="btn-primary">
              {{ actionLoading ? 'Updating...' : 'Confirm Change' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="modal">
      <div v-if="deletingUser" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header-danger">
            <h3 class="modal-title">Delete User</h3>
          </div>

          <div class="modal-body">
            <p class="warning-text">
              Are you sure you want to delete <strong>{{ deletingUser.username }}</strong>? This
              action cannot be undone.
            </p>

            <div class="danger-warning">
              <p class="warning-title">⚠️ Warning:</p>
              <ul class="warning-list">
                <li>User will lose access immediately</li>
                <li>All user data will be permanently deleted</li>
                <li>This action cannot be reversed</li>
              </ul>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeDeleteModal" :disabled="actionLoading" class="btn-secondary">
              Cancel
            </button>
            <button @click="handleDelete" :disabled="actionLoading" class="btn-danger">
              {{ actionLoading ? 'Deleting...' : 'Delete User' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Error Message -->
    <transition name="fade">
      <div v-if="errorMessage" class="error-toast">
        <span class="error-icon">❌</span>
        <span>{{ errorMessage }}</span>
      </div>
    </transition>

    <!-- Success Message -->
    <transition name="fade">
      <div v-if="successMessage" class="success-toast">
        <span class="success-icon">✅</span>
        <span>{{ successMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { userAPI } from '@/utils/api'

// State
const users = ref([])
const loading = ref(false)
const editingUser = ref(null)
const deletingUser = ref(null)
const actionLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const filteredUsers = computed(() => {
  return users.value
})

// Lifecycle
onMounted(() => {
  fetchUsers()
})

// Methods
async function fetchUsers() {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await userAPI.getAll()
    users.value = Array.isArray(data) ? data : data.content || []
    console.log('Total users loaded:', users.value.length)
    console.log('Users:', users.value)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    showError('Failed to load users, Please try again')
  } finally {
    loading.value = false
  }
}

function openEditModal(user) {
  editingUser.value = { ...user }
}

function closeEditModal() {
  editingUser.value = null
}

function openDeleteModal(user) {
  deletingUser.value = { ...user }
}

function closeDeleteModal() {
  deletingUser.value = null
}

function getNewRole(currentRole) {
  return currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
}

async function handleRoleToggle() {
  if (!editingUser.value) return

  actionLoading.value = true
  errorMessage.value = ''

  try {
    if (editingUser.value.role === 'USER') {
      // Promote to admin
      await userAPI.promoteToAdmin(editingUser.value.id)
      showSuccess(`${editingUser.value.username} promoted to Admin`)
    } else {
      // Check if demote endpoint exists, otherwise show error
      if (userAPI.demoteToUser) {
        await userAPI.demoteToUser(editingUser.value.id)
        showSuccess(`${editingUser.value.username} changed to User`)
      } else {
        showError('Demotion feature not available. Only promotion to Admin is supported.')
        closeEditModal()
        return
      }
    }

    await fetchUsers()
    closeEditModal()
  } catch (error) {
    console.error('Failed to update role:', error)
    showError(error.response?.data?.message || 'Failed to update user role')
  } finally {
    actionLoading.value = false
  }
}

async function handleDelete() {
  if (!deletingUser.value) return

  actionLoading.value = true
  errorMessage.value = ''

  try {
    await userAPI.delete(deletingUser.value.id)
    showSuccess(`User ${deletingUser.value.username} deleted successfully`)
    await fetchUsers()
    closeDeleteModal()
  } catch (error) {
    console.error('Failed to delete user:', error)
    showError(error.response?.data?.message || 'Failed to delete user')
  } finally {
    actionLoading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function showError(message) {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

function showSuccess(message) {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Expose method for parent component
defineExpose({
  fetchUsers,
})
</script>

<style scoped>
.user-list-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #3b82f6;
  transition: all 0.3s ease;
  position: relative;
}

.user-list-card:hover {
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.header-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  pointer-events: none;
}

.search-input {
  padding: 0.625rem 2.5rem 0.625rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  transition: all 0.2s;
  min-width: 250px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  background: #e5e7eb;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #d1d5db;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin-top: 1rem;
  color: #6b7280;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table thead {
  background: #f9fafb;
}

.user-table th {
  text-align: left;
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.user-table th.text-right {
  text-align: right;
}

.user-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.user-row:hover {
  background: #f9fafb;
}

.user-row td {
  padding: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar.large {
  width: 48px;
  height: 48px;
}

.avatar-icon {
  font-size: 1.125rem;
}

.username {
  font-weight: 600;
  color: #1f2937;
}

.email {
  color: #6b7280;
  font-size: 0.9375rem;
}

.date {
  color: #6b7280;
  font-size: 0.875rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.role-badge.role-admin {
  background: #dbeafe;
  color: #1e40af;
}

.role-badge.role-user {
  background: #f3e8ff;
  color: #6b21a8;
}

.role-icon {
  font-size: 0.875rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.125rem;
  transition: all 0.2s;
  background: transparent;
}

.edit-btn:hover {
  background: #eff6ff;
}

.delete-btn:hover {
  background: #fef2f2;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.modal-header-danger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.danger-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.role-change-display {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
}

.role-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
}

.role-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.arrow {
  font-size: 1.5rem;
  color: #9ca3af;
}

.warning-text {
  color: #4b5563;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.danger-warning {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 1rem;
}

.warning-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #991b1b;
  margin: 0 0 0.5rem 0;
}

.warning-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #991b1b;
  font-size: 0.875rem;
}

.warning-list li {
  margin-bottom: 0.25rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-secondary,
.btn-primary,
.btn-danger {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-secondary:disabled,
.btn-primary:disabled,
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Toast Messages */
.error-toast,
.success-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  z-index: 2000;
}

.error-toast {
  background: #fee2e2;
  border: 2px solid #ef4444;
  color: #991b1b;
}

.success-toast {
  background: #d1fae5;
  border: 2px solid #10b981;
  color: #065f46;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: 100%;
  }

  .table-container {
    overflow-x: scroll;
  }

  .user-table {
    min-width: 800px;
  }

  .error-toast,
  .success-toast {
    right: 1rem;
    left: 1rem;
  }
}
</style>