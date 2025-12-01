import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth' // ADD THIS

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth store on app load
const authStore = useAuthStore()
authStore.initializeFromToken()
// Check for expired token on app start
if (authStore.token && !authStore.isTokenValid()) {
  console.warn('Stored token is expired')
  authStore.logout()
}

app.mount('#app')

// Load Inter font
const link = document.createElement('link')
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
link.rel = 'stylesheet'
document.head.appendChild(link)
