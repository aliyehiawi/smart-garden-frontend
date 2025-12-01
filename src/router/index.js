import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    }
  ]
})

// navigation guard 
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }

    // Validate JWT token 
    if (authStore.token) {
      try {
        const payload = authStore.decodeJWT(authStore.token)
        const now = Math.floor(Date.now() / 1000)
        
        // Check if token is expired
        if (payload.exp && payload.exp < now) {
          console.warn('Token expired, logging out')
          authStore.logout()
          next('/login')
          return
        }
      } catch (error) {
        console.error('Invalid token, logging out')
        authStore.logout()
        next('/login')
        return
      }
    }
    
    next()
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router