import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function login(credentials) {
    // TODO: contact with ali to Connect backend API
    // mock data
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      user.value = { id: 1, username: 'admin', role: 'admin' }
      token.value = 'mock-token-admin'
      localStorage.setItem('token', token.value)
      return true
    } else if (credentials.username === 'user' && credentials.password === 'user') {
      user.value = { id: 2, username: 'user', role: 'user', assignedPlots: [1, 2] }
      token.value = 'mock-token-user'
      localStorage.setItem('token', token.value)
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isAuthenticated, isAdmin, login, logout }
})
