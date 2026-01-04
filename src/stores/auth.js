import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const username = computed(() => user.value?.username || '')
  const email = computed(() => user.value?.email || '')

  // Initialize auth from localStorage
  function initAuth() {
    const savedToken = localStorage.getItem('jwt_token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('Error parsing saved user:', e)
        clearAuth()
      }
    }
  }

  /**
   * Register a new user
   * @param {Object} userData  username, password, email
   */
  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.register(userData)

      // Backend returns { token, user } on successful registration
      token.value = response.token
      user.value = response.user

      // Save to localStorage
      localStorage.setItem('jwt_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Login user
   * @param {Object} credentials  username, password
   */
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.login(credentials)

      // Backend returns { token, user } on successful login
      token.value = response.token
      user.value = response.user

      // Save to localStorage
      localStorage.setItem('jwt_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Logout user
  function logout() {
    clearAuth()
    // Redirect to login is handled by router
  }

  // Fetch current user data from backend
  async function fetchCurrentUser() {
    if (!token.value) {
      return { success: false, error: 'No token found' }
    }

    loading.value = true
    error.value = null

    try {
      const userData = await authAPI.getCurrentUser()
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user data'
      error.value = errorMessage

      // If token is invalid, clear auth
      if (err.response?.status === 401) {
        clearAuth()
      }

      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Clear authentication data
  function clearAuth() {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user')
  }

  /**
   * Check if user has admin privileges
   * @returns {boolean}
   */
  function hasAdminAccess() {
    return isAdmin.value
  }

  // Initialize auth on store creation
  initAuth()

  return {
    // State
    user,
    token,
    loading,
    error,

    // Getters
    isAuthenticated,
    isAdmin,
    username,
    email,

    // Actions
    register,
    login,
    logout,
    fetchCurrentUser,
    clearAuth,
    hasAdminAccess,
    initAuth,
  }
})
