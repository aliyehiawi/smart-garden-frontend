<template>
  <div class="login-card">
    <div class="login-brand">
      <span class="brand-icon">🌱</span>
      <h1>SmartGarden</h1>
    </div>
    
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label>Username</label>
        <input v-model="username" type="text" required placeholder="Enter your username" />
      </div>
      
      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" required placeholder="Enter your password" />
      </div>
      
      <button type="submit" class="btn-login">Login to Dashboard</button>
      
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    
    <div class="demo-credentials">
      <small>Demo: <strong>admin/admin</strong> or <strong>user/user</strong></small>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  const success = authStore.login({
    username: username.value,
    password: password.value,
  })

  if (success) {
    router.push({ name: 'dashboard' })
  } else {
    error.value = 'Invalid credentials'
  }
}
</script>

<style scoped>
.login-card {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
}

.login-brand {
  text-align: center;
  margin-bottom: 2.5rem;
}

.brand-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.login-brand h1 {
  font-size: 2rem;
  color: #4caf50;
  margin: 0;
  font-weight: 700;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.btn-login {
  padding: 1rem;
  background: linear-gradient(135deg, #4caf50, #43a047);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(76, 175, 80, 0.3);
}

.error {
  color: #ef4444;
  text-align: center;
  font-size: 0.9rem;
  margin: 0;
}

.demo-credentials {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
}
</style>