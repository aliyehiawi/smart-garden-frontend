<template>
  <div class="login-page" :style="pageStyle">
    <header class="top-nav">
      <div class="nav-left">
        <span class="brand-icon">🌱</span>
        <span class="brand-name">SmartGarden</span>
      </div>
    </header>

    <div class="login-center">
      <div class="login-card">
        <div class="login-brand">
          <span class="brand-icon-large">🌱</span>
          <h1>Login</h1>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <input v-model="username" type="text" required placeholder="Username" />
          </div>

          <div class="form-group">
            <input v-model="password" type="password" required placeholder="Password" />
          </div>

          <div class="actions-row">
            <button type="submit" class="btn-primary">Login</button>
          </div>

          <div class="actions-row">
            <button type="submit" class="btn-primary">Sign Up</button>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <div class="divider"><span>or sign up with</span></div>

          <div class="social-row">
            <button type="button" class="social facebook" aria-label="Sign up with Facebook">
              <img :src="facebookLogo" alt="Facebook" class="social-icon" />
            </button>
            <button type="button" class="social google" aria-label="Sign up with Google">
              <img :src="googleLogo" alt="Google" class="social-icon" />
            </button>
          </div>
        </form>

        <div class="demo-credentials">
          <small>Demo credentials: <strong>admin/admin</strong> or <strong>user/user</strong></small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import bg from '@/assets/garden-bg.png'
import facebookLogo from '@/assets/Facebook_Logo.png.webp'
import googleLogo from '@/assets/Google__G__logo.svg.png'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

const pageStyle = {
  backgroundImage: `url(${bg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: '100vh'
}

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
.login-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
}

.top-nav {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.login-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 340px;
  min-height: 400px;
  padding: 32px;
  border-radius: 18px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(2,6,23,0.25);
  border: 1px solid rgba(255,255,255,0.12);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.login-brand { text-align:center; margin-bottom: 0.75rem }
.brand-icon-large { font-size: 48px; display:block; margin-bottom: 8px }
.login-brand h1 { color: white; font-size: 28px; margin: 0 }
.login-brand .subtext { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 8px }

.login-form { display:flex; flex-direction:column; gap: 18px }
.form-group input { padding: 12px 10px; border: none; border-bottom: 1px solid rgba(255,255,255,0.18); background: transparent; color: #fff; height: 42px; font-size: 15px }
.form-group input::placeholder { color: rgba(255,255,255,0.7) }

.actions-row { display:flex; gap: 12px }
.btn-primary { width: 100%; background: #34A853; color: white; border: none; padding: 12px 16px; border-radius: 24px; font-weight: 700; font-size: 16px }

.divider { display:flex; align-items:center; gap: 12px; margin-top: 6px }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.12) }
.divider span { font-size: 12px; color: rgba(255,255,255,0.7); padding: 0 8px }

.social-row { display:flex; gap: 16px; justify-content: center; margin-top: 6px }
.social { width: 36px; height: 36px; border-radius: 50%; border: none; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; cursor: pointer }
.social.facebook { background: #1877F2; color: white }
.social.google { background: white; color: white }

.social-icon { width: 18px; height: 18px; display: block }

.error { color: #f12525; text-align:center }
.demo-credentials { text-align:center; margin-top: 12px; color: rgba(255,255,255,0.8) }
</style>