// ============================================================
// API ENDPOINTS - FOR BACKEND INTEGRATION
// ============================================================
// This file documents all API endpoints needed from backend
// Share this with your backend partner
// ============================================================

/*

BASE URL: http://localhost:8080/api

===== AUTHENTICATION =====

1. Login
   POST /api/auth/login
   Body: { username: string, password: string }
   Response: { token: string, user: { id, username, role, email } }

2. Register (Admin only)
   POST /api/auth/register
   Headers: { Authorization: Bearer <token> }
   Body: { username: string, email: string, password: string, role: string }
   Response: { message: string, user: object }

===== DEVICES =====

3. Register Device
   POST /api/devices/register
   Headers: { Authorization: Bearer <token> }
   Body: { device_name: string, location: string }
   Response: { device_id: number, device_key: string }

4. Get All Devices
   GET /api/devices
   Headers: { Authorization: Bearer <token> }
   Response: { devices: array }

5. Update Device Thresholds
   PUT /api/devices/:id/thresholds
   Headers: { Authorization: Bearer <token> }
   Body: { min: number, max: number }
   Response: { message: string }

6. Start Pump Manually
   POST /api/devices/:id/pump/start
   Headers: { Authorization: Bearer <token> }
   Response: { message: string, pump_status: string }

===== SENSORS / WATER LEVEL =====

7. Get Current Sensor Data
   GET /api/devices/:id/current
   Headers: { Authorization: Bearer <token> }
   Response: { 
     device_id: number,
     water_level: number,
     pump_status: string,
     timestamp: string,
     min_threshold: number,
     max_threshold: number
   }

8. Get Water Level History
   GET /api/devices/:id/history
   Headers: { Authorization: Bearer <token> }
   Query: ?from=timestamp&to=timestamp&limit=100
   Response: { 
     history: [
       { 
         timestamp: string,
         water_level: number,
         min_threshold: number,
         max_threshold: number,
         pump_status: string
       }
     ]
   }

===== USERS (Admin Only) =====

9. Get All Users
   GET /api/users
   Headers: { Authorization: Bearer <token> }
   Response: { users: array }

10. Make User Admin
    PUT /api/users/:id/make-admin
    Headers: { Authorization: Bearer <token> }
    Response: { message: string, user: object }

11. Delete User
    DELETE /api/users/:id
    Headers: { Authorization: Bearer <token> }
    Response: { message: string }

===== WEBSOCKET =====

12. Real-time Updates
    WebSocket: ws://localhost:8080/api/ws
    Authentication: Send token after connection
    Message format: { 
      type: "sensor_update",
      device_id: number,
      water_level: number,
      pump_status: string,
      timestamp: string
    }

===== MQTT TOPICS (Backend handles these) =====

Hardware → Backend:
  devices/<device_key>/sensor/data
  devices/<device_key>/status

Backend → Hardware:
  devices/<device_key>/thresholds/update
  devices/<device_key>/pump/start

*/

// ============================================================
// TODO: Update this base URL when backend is deployed
// ============================================================
export const API_BASE_URL = 'http://localhost:8080/api'

// ============================================================
// API REQUEST WRAPPER - Use this for all API calls
// ============================================================
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

export async function apiRequest(endpoint, options = {}) {
  const authStore = useAuthStore()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  // Add JWT token
  if (authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })
    
    // Handle 401 (expired token)
    if (response.status === 401) {
      console.error('Unauthorized: Token expired')
      authStore.logout()
      router.push('/login')
      throw new Error('Unauthorized')
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Convenience methods
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
}