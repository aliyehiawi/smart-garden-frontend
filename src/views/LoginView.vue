<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-brand">
        <span class="brand-icon">🌱</span>
        <h1>SmartGarden</h1>
        <p>IoT Water Level Monitoring System</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Username</label>
          <input 
            v-model="loginForm.username" 
            type="text" 
            required 
            placeholder="Enter username"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            v-model="loginForm.password" 
            type="password" 
            required 
            placeholder="Enter your password"
            autocomplete="current-password"
          />
        </div>

        <div class="form-group remember-row">
          <label class="remember-label">
            <input type="checkbox" v-model="rememberMe" />
            Remember me
          </label>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>

        <!-- Debug Info 
        <div v-if="debugInfo && isDevelopment" class="debug-info">
          <p><strong>Debug Info:</strong></p>
          <p>API URL: {{ apiBaseUrl }}</p>
          <p>Status: {{ debugInfo }}</p>
        </div>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="error" class="error-message">{{ error }}</p>
        -->
      </form>
       

      <!-- Demo Credentials 
      <div class="demo-credentials">
        <small>Demo: <strong>admin/admin123</strong> or <strong>user/user</strong></small>
      </div>
      <p class="demo-note">
        💡 Admins can register new users from the Dashboard
      </p>
      -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const rememberMe = ref(false)
const debugInfo = ref('')
const apiBaseUrl = ref(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
const isDevelopment = ref(false)


const loginForm = ref({
  username: '',
  password: ''
})

onMounted(() => {
  // Check if backend is reachable
  checkBackendConnection()
  
  // Load remembered username
  try {
    const remembered = localStorage.getItem('rememberMe') === 'true'
    if (remembered) {
      rememberMe.value = true
      loginForm.value.username = localStorage.getItem('rememberUsername') || ''
    }
  } catch (e) {
    console.warn('localStorage not available:', e)
  }
})

async function checkBackendConnection() {
  try {
    // Use correct actuator endpoint from backend
    const response = await fetch(`${apiBaseUrl.value}/actuator/health`)
    if (response.ok) {
      debugInfo.value = 'Backend is running'
      console.log('Backend connection OK')
    } else {
      debugInfo.value = 'Backend returned error'
      console.error('Backend returned:', response.status)
    }
  } catch (err) {
    debugInfo.value = 'Cannot connect to backend'
    console.error('Backend connection failed:', err)
    error.value = 'Cannot connect to backend. Please ensure the server is running on http://localhost:8080'
  }
}

async function handleLogin() {
  error.value = ''
  successMessage.value = ''
  debugInfo.value = ''
  isLoading.value = true

  console.log('Attempting login with:', {
    username: loginForm.value.username,
    apiUrl: apiBaseUrl.value
  })

  try {
    const result = await authStore.login({
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    if (result.success) {
      successMessage.value = 'Login successful! Redirecting...'
      console.log('Login successful, redirecting to dashboard')

      // Remember username 
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('rememberUsername', loginForm.value.username)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('rememberUsername')
      }

      setTimeout(() => {
        router.push('/')
      }, 500)
    } else {
      error.value = result.error
      console.error('Login failed:', result.error)
    }

  } catch (err) {
    error.value = err.message || 'An error occurred. Please try again!'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  padding: 40px 20px;
  overflow-y: auto;
  min-height: 100vh;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  margin: auto;
}

.login-brand {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.login-brand h1 {
  font-size: 2rem;
  color: #10B981;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.login-brand p {
  color: #6B7280;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.875rem;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.remember-row {
  display: flex;
  align-items: center;
}

.remember-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #374151;
}

.remember-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #10B981;
}

.btn-primary {
  padding: 1rem;
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.debug-info {
  padding: 0.75rem;
  background: #F3F4F6;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #6B7280;
  margin: 0;
}

.debug-info p {
  margin: 0.25rem 0;
}

.error-message {
  color: #DC2626;
  text-align: center;
  font-size: 0.9rem;
  margin: 0;
  padding: 0.75rem;
  background: #FEE2E2;
  border-radius: 8px;
}

.success-message {
  color: #059669;
  text-align: center;
  font-size: 0.9rem;
  margin: 0;
  padding: 0.75rem;
  background: #D1FAE5;
  border-radius: 8px;
}

.demo-credentials {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #E5E7EB;
  color: #6B7280;
}

.demo-note {
  text-align: center;
  font-size: 0.65rem;
  color: #6B7280;
  margin: 0.5rem 0 0 0;
  padding: 0.75rem;
  background: #f0efef;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .login-container {
    padding: 20px 15px;
  }
  
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .brand-icon {
    font-size: 3rem;
  }
  
  .login-brand h1 {
    font-size: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .login-container {
    justify-content: center !important;
    align-items: center !important;
  }
  
  .login-card {
    margin: 0 auto;
  }
}
</style>