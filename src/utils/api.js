import axios from 'axios'

// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/api/ws'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor, Add JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor, Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth and redirect to login
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// AUTHENTICATION ENDPOINTS

export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData username, password, email
   * @returns {Promise} token, user
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  /**
   * Login user
   * @param {Object} credentials username, password
   * @returns {Promise} token, user
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Get current authenticated user
   * @returns {Promise} User object
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}

// DEVICE MANAGEMENT ENDPOINTS (Admin Only)

export const deviceAPI = {
  /**
   * Register a new device (Admin only)
   * @param {Object} deviceData  name, location
   * @returns {Promise}  id, name, location, deviceKey, createdAt
   */
  register: async (deviceData) => {
    const response = await apiClient.post('/devices/register', deviceData)
    return response.data
  },

  /**
   * Get all devices
   * @returns {Promise} Array of devices
   */
  getAll: async () => {
    const response = await apiClient.get('/devices')
    // Backend returns paginated response with content array
    return response.data.content || response.data
  },

  /**
   * Delete a device (Admin only)
   * @param {number} deviceId
   * @returns {Promise}
   */
  delete: async (deviceId) => {
    const response = await apiClient.delete(`/devices/${deviceId}`)
    return response.data
  },
}

// THRESHOLD MANAGEMENT ENDPOINTS (Admin Only)

export const thresholdAPI = {
  /**
   * Get device thresholds
   * @param {number} deviceId
   * @returns {Promise}  upperThreshold, lowerThreshold
   */
  get: async (deviceId) => {
    const response = await apiClient.get(`/devices/${deviceId}/thresholds`)
    return response.data
  },

  /**
   * Update device thresholds (Admin only)
   * @param {number} deviceId
   * @param {Object} thresholds  upperThreshold, lowerThreshold
   * @returns {Promise} Updated thresholds
   */
  update: async (deviceId, thresholds) => {
    const response = await apiClient.put(`/devices/${deviceId}/thresholds`, thresholds)
    return response.data
  },
}

// PUMP CONTROL ENDPOINTS (Admin Only)

export const pumpAPI = {
  /**
   * Start pump manually (Admin only)
   * @param {number} deviceId
   * @returns {Promise} Success message
   */
  start: async (deviceId) => {
    const response = await apiClient.post(`/devices/${deviceId}/pump/start`)
    return response.data
  },

  /**
   * Get pump status
   * @param {number} deviceId
   * @returns {Promise}  isRunning, lastStartedAt, manualControl
   */
  getStatus: async (deviceId) => {
    const response = await apiClient.get(`/devices/${deviceId}/pump/status`)
    return response.data
  },
}

// WATER LEVEL DATA ENDPOINTS (Authenticated Users)

export const waterLevelAPI = {
  /**
   * Get paginated water level data
   * @param {number} deviceId
   * @param {Object} params  page: 0, size: 20, sort: 'timestamp,desc'
   * @returns {Promise}  content: [], totalElements, totalPages, number, size
   */
  getData: async (deviceId, params = { page: 0, size: 20, sort: 'timestamp,desc' }) => {
    const response = await apiClient.get(`/devices/${deviceId}/water-level-data`, { params })
    return response.data
  },
}

// USER MANAGEMENT ENDPOINTS (Admin Only)

export const userAPI = {
  /**
   * Get all users (Admin only)
   * @returns {Promise} Array of users
   */
  getAll: async () => {
    const response = await apiClient.get('/users')
    return response.data
  },

  /**
   * Create a new user (Admin only)
   * Creates user via /auth/register and optionally promotes to admin
   * @param {Object} userData { username, email, password, role }
   * @returns {Promise} { user, temporaryPassword }
   */
  createUser: async (userData) => {
    // Register the user first
    const registerResponse = await authAPI.register({
      username: userData.username,
      email: userData.email,
      password: userData.password,
    })

    let user = registerResponse.user

    // If role is admin, promote the user
    if (userData.role === 'admin') {
      user = await userAPI.promoteToAdmin(user.id)
    }

    return {
      user: user,
      temporaryPassword: userData.password,
    }
  },

  /**
   * Promote user to admin (Admin only)
   * @param {number} userId
   * @returns {Promise} Updated user
   */
  promoteToAdmin: async (userId) => {
    const response = await apiClient.put(`/users/${userId}/promote`)
    return response.data
  },

  /**
   * Delete user (Admin only)
   * @param {number} userId
   * @returns {Promise}
   */
  delete: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`)
    return response.data
  },
}

// WEBSOCKET CONNECTION

export class WebSocketClient {
  constructor() {
    this.socket = null
    this.stompClient = null
    this.subscriptions = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
  }

  /**
   * Connect to WebSocket
   * @param {Function} onConnectCallback  Called when connected
   */
  connect(onConnectCallback) {
    const token = localStorage.getItem('jwt_token')

    // Using SockJS and STOMP for WebSocket connection
    // we need to install: npm install sockjs-client @stomp/stompjs
    import('sockjs-client').then(({ default: SockJS }) => {
      import('@stomp/stompjs').then(({ Client }) => {
        this.stompClient = new Client({
          webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
          debug: (str) => {
            if (import.meta.env.DEV) console.log('STOMP:', str)
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('WebSocket Connected')
            this.reconnectAttempts = 0
            if (onConnectCallback) onConnectCallback()
          },
          onStompError: (frame) => {
            console.error('STOMP error:', frame)
          },
          onWebSocketClose: () => {
            console.log('WebSocket connection closed')
            this.handleReconnect(onConnectCallback)
          },
        })

        this.stompClient.activate()
      })
    })
  }

  // Handle reconnection logic
  handleReconnect(onConnectCallback) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      )
      setTimeout(() => this.connect(onConnectCallback), this.reconnectDelay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  /**
   * Subscribe to device updates
   * @param {number} deviceId
   * @param {Function} callback  Called with message data
   * @returns {string} Subscription ID
   */
  subscribeToDevice(deviceId, callback) {
    if (!this.stompClient?.connected) {
      console.error('WebSocket not connected')
      return null
    }

    const topic = `/topic/device/${deviceId}`
    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body)
        callback(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })

    const subscriptionId = `device-${deviceId}`
    this.subscriptions.set(subscriptionId, subscription)
    return subscriptionId
  }

  /**
   * Unsubscribe from a topic
   * @param {string} subscriptionId
   */
  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionId)
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.stompClient) {
      this.subscriptions.forEach((sub) => sub.unsubscribe())
      this.subscriptions.clear()
      this.stompClient.deactivate()
      this.stompClient = null
    }
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.stompClient?.connected || false
  }
}

// Create singleton WebSocket instance
export const wsClient = new WebSocketClient()

// Export axios instance for custom requests
export default apiClient
