import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // ============================================================
  // TODO: BACKEND API - These functions use mock data
  // ============================================================
  // When backend is ready:
  // 1. Remove generateMockJWT() - backend will generate real JWT
  // 2. Update login() to call backend API instead of mock
  // 3. Keep decodeJWT(), logout(), and initializeFromToken() - they work with real JWTs too
  // ============================================================

  // MOCK JWT Generator - REMOVE when backend provides real JWT
  function generateMockJWT(payload) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = btoa(JSON.stringify(payload))
    const signature = btoa('mock-signature-' + Math.random())
    return `${header}.${body}.${signature}`
  }

  // Decode JWT token (works with both mock and real JWTs)
  function decodeJWT(jwtToken) {
    try {
      const parts = jwtToken.split('.')
      if (parts.length !== 3) return null
      const payload = JSON.parse(atob(parts[1]))
      return payload
    } catch (e) {
      console.error('Failed to decode JWT:', e)
      return null
    }
  }

  // Initialize user from stored token (works with both mock and real JWTs)
  function initializeFromToken() {
    if (token.value) {
      const payload = decodeJWT(token.value)
      if (payload) {
        user.value = payload
      } else {
        logout()
      }
    }
  }

  // ============================================================
  // TODO: BACKEND API - LOGIN FUNCTION
  // ============================================================
  // This is MOCK login - replace with backend API call
  // 
  // Expected backend API:
  //   POST /api/auth/login
  //   Body: { username: string, password: string }
  //   Response: { token: string, user: object }
  //
  // Replace the entire function body with:
  /*
  async function login(credentials) {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      
      token.value = data.token
      user.value = data.user

      localStorage.setItem('authToken', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }
  */
  // ============================================================
  // END TODO: Remove mock login below
  // ============================================================

  // MOCK LOGIN - REMOVE WHEN BACKEND IS READY
  function login(credentials) {
    let userData = null

    if (credentials.username === 'admin' && credentials.password === 'admin') {
      userData = { id: 1, username: 'admin', role: 'admin', email: 'admin@smartgarden.com' }
    } else if (credentials.username === 'user' && credentials.password === 'user') {
      userData = { id: 2, username: 'user', role: 'user', email: 'user@smartgarden.com' }
    }

    if (!userData) {
      return false
    }

    const jwtPayload = {
      ...userData,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 1 week
    }

    token.value = generateMockJWT(jwtPayload)
    user.value = userData

    localStorage.setItem('authToken', token.value)
    localStorage.setItem('user', JSON.stringify(userData))

    return true
  }
  // END MOCK LOGIN

  // Logout function (works with both mock and real backend)
  function logout() {
    user.value = null
    token.value = null
    
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberMe')
    localStorage.removeItem('rememberUsername')
    localStorage.clear()
    
    return true
  }

  // Check if token is still valid
  function isTokenValid() {
    if (!token.value) return false
    
    try {
      const payload = decodeJWT(token.value)
      const now = Math.floor(Date.now() / 1000)
      
      if (payload.exp && payload.exp < now) {
        return false
      }
      
      return true
    } catch (error) {
      return false
    }
  }

  // Auto-logout if token expires
  function checkTokenExpiration() {
    if (token.value && !isTokenValid()) {
      console.warn('Token expired during session')
      logout()
      window.location.href = '/login'
    }
  }

  // Check token every minute
  setInterval(checkTokenExpiration, 60000)

  initializeFromToken()

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    initializeFromToken,
    decodeJWT,
    isTokenValid,
    checkTokenExpiration
  }
})