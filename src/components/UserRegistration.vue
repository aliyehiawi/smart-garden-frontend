<template>
  <div class="registration-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Register New User</h3>
        <p class="subtitle">Create a new user account</p>
      </div>
    </div>

    <!-- Registration Form -->
    <div v-if="!showSuccess" class="registration-form">
      <div class="form-row">
        <div class="form-group">
          <label for="fullName" class="form-label">
            <span>Full Name</span>
            <span class="required">*</span>
          </label>
          <input
            id="fullName"
            v-model="formData.fullName"
            type="text"
            placeholder="John Doe"
            class="form-input"
            :class="{ 'input-error': errors.fullName }"
            @input="clearError('fullName')"
            :disabled="loading"
          />
          <span v-if="errors.fullName" class="error-text">{{ errors.fullName }}</span>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">
            <span>Email Address</span>
            <span class="required">*</span>
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="user@example.com"
            class="form-input"
            :class="{ 'input-error': errors.email }"
            @input="clearError('email')"
            :disabled="loading"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="username" class="form-label">
            <span>Username</span>
            <span class="required">*</span>
          </label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="johndoe"
            class="form-input"
            :class="{ 'input-error': errors.username }"
            @input="clearError('username')"
            :disabled="loading"
          />
          <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="role" class="form-label">
            <span>Role</span>
            <span class="required">*</span>
          </label>
          <select id="role" v-model="formData.role" class="form-select" :disabled="loading">
            <option value="user">User (Read-Only)</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
        </div>
      </div>

      <!-- Password Options -->
      <div class="password-options">
        <label class="checkbox-label">
          <input type="checkbox" v-model="autoGeneratePassword" @change="handlePasswordToggle" />
          <span>Auto-generate secure password</span>
        </label>
      </div>

      <!-- Manual Password Inputs -->
      <div v-if="!autoGeneratePassword" class="form-row">
        <div class="form-group">
          <label for="password" class="form-label">
            <span>Password</span>
            <span class="required">*</span>
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="••••••••"
            class="form-input"
            :class="{ 'input-error': errors.password }"
            @input="clearError('password')"
            :disabled="loading"
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">
            <span>Confirm Password</span>
            <span class="required">*</span>
          </label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="••••••••"
            class="form-input"
            :class="{ 'input-error': errors.confirmPassword }"
            @input="clearError('confirmPassword')"
            :disabled="loading"
          />
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>
      </div>

      <button @click="registerUser" class="btn-register" :disabled="loading">
        <span class="btn-icon">{{ loading ? '' : '' }}</span>
        <span>{{ loading ? 'Creating Account...' : 'Register User' }}</span>
      </button>
    </div>

    <!-- Success Display -->
    <div v-else class="success-display">
      <!-- Success Header -->
      <div class="success-header">
        <span class="success-icon">✅</span>
        <div>
          <h4>User Account Created Successfully!</h4>
          <p>Share these credentials with the new user securely.</p>
        </div>
      </div>

      <!-- User Credentials -->
      <div class="credentials-grid">
        <div class="credential-item">
          <span class="credential-label">Full Name</span>
          <span class="credential-value">{{ registeredUser.fullName }}</span>
        </div>

        <div class="credential-item">
          <span class="credential-label">Email</span>
          <span class="credential-value">{{ registeredUser.email }}</span>
        </div>

        <div class="credential-item">
          <span class="credential-label">Username</span>
          <div class="credential-value-wrapper">
            <code class="credential-value">{{ registeredUser.username }}</code>
            <button
              @click="copyToClipboard(registeredUser.username)"
              class="btn-copy"
              title="Copy Username"
            ></button>
          </div>
        </div>

        <div class="credential-item">
          <span class="credential-label">Role</span>
          <span class="role-badge" :class="`role-${registeredUser.role}`">
            {{ registeredUser.role === 'admin' ? 'Admin' : 'User' }}
          </span>
        </div>

        <div class="credential-item">
          <span class="credential-label">User ID</span>
          <code class="credential-value">{{ registeredUser.userId }}</code>
        </div>
      </div>

      <!-- Temporary Password Shown Once Only -->
      <div class="password-section">
        <div class="password-header">
          <span class="password-icon">🔑</span>
          <div>
            <strong>Temporary Password (One-Time Display)</strong>
            <p>This password will only be shown once. The user must change it on first login.</p>
          </div>
        </div>

        <div class="password-display">
          <code class="password-value">{{ registeredUser.temporaryPassword }}</code>
          <button
            @click="copyToClipboard(registeredUser.temporaryPassword)"
            class="btn-copy-password"
          >
            Copy Password
          </button>
        </div>
      </div>

      <!-- Security Warning -->
      <div class="security-warning">
        <span class="warning-icon">⚠️</span>
        <div class="warning-content">
          <strong>Security Notice:</strong>
          <ul>
            <li>This password is temporary and must be changed on first login</li>
            <li>Share credentials through a secure channel (encrypted email, direct message)</li>
            <li>Never share passwords via unencrypted communication</li>
            <li>The password will not be shown again after closing this message</li>
            <li>User must use these credentials to log in and set a new password</li>
          </ul>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="copyAllCredentials" class="btn-action btn-copy-all">
          Copy All Credentials
        </button>
        <button @click="resetForm" class="btn-action btn-new">Register Another User</button>
      </div>

      <!-- Copy Feedback -->
      <transition name="fade">
        <div v-if="copyFeedback" class="copy-feedback">✅ {{ copyFeedback }}</div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { userAPI } from '@/utils/api'

const autoGeneratePassword = ref(true)
const loading = ref(false)
const showSuccess = ref(false)
const copyFeedback = ref('')

const formData = reactive({
  fullName: '',
  email: '',
  username: '',
  role: 'user',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  fullName: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const registeredUser = ref({
  userId: '',
  fullName: '',
  email: '',
  username: '',
  role: '',
  temporaryPassword: '',
})

function clearError(field) {
  errors[field] = ''
}

function handlePasswordToggle() {
  if (autoGeneratePassword.value) {
    formData.password = ''
    formData.confirmPassword = ''
    errors.password = ''
    errors.confirmPassword = ''
  }
}

function validateForm() {
  let isValid = true

  // Full Name
  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required'
    isValid = false
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Invalid email format'
    isValid = false
  }

  // Username
  if (!formData.username.trim()) {
    errors.username = 'Username is required'
    isValid = false
  } else if (formData.username.length < 3) {
    errors.username = 'Username must be at least 3 characters'
    isValid = false
  }

  // Password if not auto-generating
  if (!autoGeneratePassword.value) {
    if (!formData.password) {
      errors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
      isValid = false
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm password'
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      isValid = false
    }
  }

  return isValid
}

function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

async function registerUser() {
  if (!validateForm()) return

  loading.value = true

  try {
    // Generate or use provided password
    const tempPassword = autoGeneratePassword.value ? generateSecurePassword() : formData.password

    // Call actual backend API to create user
    const response = await userAPI.createUser({
      username: formData.username,
      email: formData.email,
      password: tempPassword,
      role: formData.role,
    })

    // Store registration details to show user
    registeredUser.value = {
      userId: response.user.id,
      fullName: formData.fullName,
      email: response.user.email,
      username: response.user.username,
      role: response.user.role,
      temporaryPassword: tempPassword,
    }

    showSuccess.value = true
  } catch (error) {
    console.error('User registration error:', error)
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data ||
      'Failed to create user. Please try again.'
    errors.username = errorMessage
  } finally {
    loading.value = false
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    copyFeedback.value = 'Copied to clipboard!'
    setTimeout(() => {
      copyFeedback.value = ''
    }, 2000)
  })
}

function copyAllCredentials() {
  const credentials = `New User Account

Full Name: ${registeredUser.value.fullName}
Email: ${registeredUser.value.email}
Username: ${registeredUser.value.username}
Role: ${registeredUser.value.role}
User ID: ${registeredUser.value.userId}

Temporary Password: ${registeredUser.value.temporaryPassword}

⚠️ Important:
- This is a temporary password
- Must be changed on first login
- Keep this information secure`

  copyToClipboard(credentials)
}

function resetForm() {
  Object.keys(formData).forEach((key) => {
    formData[key] = key === 'role' ? 'user' : ''
  })
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  autoGeneratePassword.value = true
  showSuccess.value = false
  registeredUser.value = {
    userId: '',
    fullName: '',
    email: '',
    username: '',
    role: '',
    temporaryPassword: '',
  }
}
</script>

<style scoped>
.registration-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #8b5cf6;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.registration-card:hover {
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
  transform: translateY(-4px);
  border-color: #8b5cf6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.title-section h3 {
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

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  color: #1f2937;
  background: white;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-input.input-error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.8125rem;
  font-weight: 500;
}

.password-options {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #374151;
  font-weight: 500;
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn-register {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 56px;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.btn-register:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 1.25rem;
}

.success-display {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.success-header {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border: 2px solid #10b981;
  border-radius: 12px;
}

.success-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.success-header h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #065f46;
  margin: 0 0 0.25rem 0;
}

.success-header p {
  font-size: 0.875rem;
  color: #047857;
  margin: 0;
}

.credentials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.credential-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
}

.credential-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.credential-value-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.credential-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  font-family: 'Courier New', monospace;
  flex: 1;
  word-break: break-all;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.role-admin {
  background: #dbeafe;
  color: #1e40af;
}

.role-user {
  background: #e0e7ff;
  color: #4338ca;
}

.btn-copy {
  padding: 0.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  flex-shrink: 0;
}

.btn-copy:hover {
  border-color: #8b5cf6;
  background: #f5f3ff;
}

.password-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb);
  border: 2px solid #f5f3ff;
  border-radius: 12px;
}

.password-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.password-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.password-header strong {
  display: block;
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.password-header p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.password-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #1e40af;
  border-radius: 10px;
}

.password-value {
  flex: 1;
  font-size: 1.125rem;
  font-weight: 700;
  color: #6b7280;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  padding: 0.5rem;
  background: #e0e7ff;
  border-radius: 6px;
  letter-spacing: 1px;
}

.btn-copy-password {
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #1e40af);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-copy-password:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4);
}

.security-warning {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 2px solid #ef4444;
  border-radius: 12px;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-content strong {
  display: block;
  font-size: 0.9375rem;
  color: #991b1b;
  margin-bottom: 0.5rem;
}

.warning-content ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #991b1b;
  font-size: 0.8125rem;
  line-height: 1.6;
}

.warning-content li {
  margin-bottom: 0.25rem;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy-all {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-copy-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-new {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.copy-feedback {
  padding: 1rem;
  background: #d1fae5;
  border: 2px solid #10b981;
  border-radius: 10px;
  color: #065f46;
  font-weight: 600;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .credentials-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .password-display {
    flex-direction: column;
  }

  .btn-copy-password {
    width: 100%;
  }
}
</style>
