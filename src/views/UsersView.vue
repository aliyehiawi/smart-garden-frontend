<template>
  <div class="users-view">
    <div class="container">
      <div class="page-header">
        <h1>User Management</h1>
        <button @click="showAddModal = true" class="btn-primary">
          ➕ Add New User
        </button>
      </div>

      <!-- Users Table -->
      <div class="card">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Assigned Plots</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <div class="user-info">
                  <span class="user-avatar">{{ user.username[0].toUpperCase() }}</span>
                  <span>{{ user.username }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="`badge-${user.role}`">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ formatAssignedPlots(user.assignedPlots) }}</td>
              <td>
                <span class="status-badge" :class="`status-${user.status}`">
                  {{ user.status }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editUser(user)" class="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    class="btn-icon"
                    :title="user.status === 'active' ? 'Deactivate' : 'Activate'"
                  >
                    {{ user.status === 'active' ? '🔴' : '🟢' }}
                  </button>
                  <button
                    v-if="user.id !== 1"
                    @click="deleteUser(user.id)"
                    class="btn-icon btn-danger"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit User Modal -->
      <div v-if="showAddModal || editingUser" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
            <button @click="closeModal" class="btn-close">✕</button>
          </div>

          <form @submit.prevent="saveUser" class="user-form">
            <div class="form-group">
              <label>Username *</label>
              <input
                v-model="userForm.username"
                type="text"
                required
                placeholder="Enter username"
              />
            </div>

            <div class="form-group" v-if="!editingUser">
              <label>Password *</label>
              <input
                v-model="userForm.password"
                type="password"
                :required="!editingUser"
                placeholder="Enter password"
              />
            </div>

            <div class="form-group">
              <label>Role *</label>
              <select v-model="userForm.role" required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div class="form-group" v-if="userForm.role === 'user'">
              <label>Assigned Plot IDs (comma-separated)</label>
              <input
                v-model="assignedPlotsInput"
                type="text"
                placeholder="e.g., 1,2,3"
              />
              <small>Plots this user can access</small>
            </div>

            <div class="form-group">
              <label>Email</label>
              <input
                v-model="userForm.email"
                type="email"
                placeholder="user@example.com"
              />
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                {{ editingUser ? 'Update' : 'Create' }} User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const users = ref([
  {
    id: 1,
    username: 'admin',
    role: 'admin',
    assignedPlots: [],
    status: 'active',
    email: 'admin@smartgarden.com',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'user',
    role: 'user',
    assignedPlots: [1, 2],
    status: 'active',
    email: 'user@smartgarden.com',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 3,
    username: 'john_doe',
    role: 'user',
    assignedPlots: [3],
    status: 'active',
    email: 'john@example.com',
    createdAt: '2024-02-01T00:00:00Z',
  },
])

const showAddModal = ref(false)
const editingUser = ref(null)
const userForm = ref({
  username: '',
  password: '',
  role: 'user',
  assignedPlots: [],
  email: '',
})
const assignedPlotsInput = ref('')

function editUser(user) {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    password: '',
    role: user.role,
    assignedPlots: [...user.assignedPlots],
    email: user.email || '',
  }
  assignedPlotsInput.value = user.assignedPlots.join(',')
}

function closeModal() {
  showAddModal.value = false
  editingUser.value = null
  userForm.value = {
    username: '',
    password: '',
    role: 'user',
    assignedPlots: [],
    email: '',
  }
  assignedPlotsInput.value = ''
}

function saveUser() {
  const assignedPlots =
    userForm.value.role === 'admin'
      ? []
      : assignedPlotsInput.value
          .split(',')
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))

  if (editingUser.value) {
    // Update existing user
    const index = users.value.findIndex((u) => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        username: userForm.value.username,
        role: userForm.value.role,
        assignedPlots,
        email: userForm.value.email,
      }
    }
  } else {
    // Add new user
    const newUser = {
      id: users.value.length + 1,
      username: userForm.value.username,
      role: userForm.value.role,
      assignedPlots,
      status: 'active',
      email: userForm.value.email,
      createdAt: new Date().toISOString(),
    }
    users.value.push(newUser)
  }

  closeModal()
}

function toggleUserStatus(user) {
  user.status = user.status === 'active' ? 'inactive' : 'active'
}

function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    const index = users.value.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
  }
}

function formatAssignedPlots(plots) {
  if (!plots || plots.length === 0) return 'All'
  return `Plot ${plots.join(', ')}`
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.users-view {
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #5568d3;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  text-align: left;
  padding: 1rem;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.users-table tr:hover {
  background: #f8f9fa;
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
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
}

.badge-admin {
  background: #667eea;
  color: white;
}

.badge-user {
  background: #48bb78;
  color: white;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-icon:hover {
  background: #e0e0e0;
}

.btn-danger:hover {
  background: #f8d7da;
}

/* Modal Styles (same as DevicesView) */
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
  border-radius: 10px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group small {
  color: #999;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.form-actions .btn-primary {
  flex: 1;
}

@media (max-width: 768px) {
  .users-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>