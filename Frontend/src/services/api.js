import axios from 'axios'

// Connection state management
let connectionState = {
  isConnected: true,
  lastSuccessfulRequest: Date.now(),
  retryCount: 0,
  maxRetries: 3
}

// Health check function
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      method: 'GET',
      timeout: 5000
    })
    return response.ok
  } catch (error) {
    return false
  }
}

// Connection recovery function
const attemptReconnection = async () => {
  console.log('Attempting to reconnect to backend...')
  
  for (let i = 0; i < connectionState.maxRetries; i++) {
    try {
      const isHealthy = await checkBackendHealth()
      if (isHealthy) {
        connectionState.isConnected = true
        connectionState.retryCount = 0
        connectionState.lastSuccessfulRequest = Date.now()
        console.log('Backend connection restored!')
        
        // Dispatch reconnection event
        window.dispatchEvent(new CustomEvent('backendReconnected'))
        return true
      }
    } catch (error) {
      console.warn(`Reconnection attempt ${i + 1} failed:`, error)
    }
    
    // Wait before next attempt with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, i), 10000)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  return false
}

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.MODE === 'production') {
    return '/api';
  }
  
  const currentHost = window.location.hostname;
  return `http://${currentHost}:5000/api`;
}

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
  retryDelay: 1000,
})

// Request retry wrapper
const withRetry = async (requestFn, maxRetries = 3) => {
  let lastError
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await requestFn()
      connectionState.isConnected = true
      connectionState.lastSuccessfulRequest = Date.now()
      connectionState.retryCount = 0
      return result
    } catch (error) {
      lastError = error
      
      // Don't retry on authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error
      }
      
      // Don't retry on client errors (400-499)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error
      }
      
      // Connection lost
      if (!error.response) {
        connectionState.isConnected = false
        connectionState.retryCount = attempt + 1
        
        if (attempt < maxRetries - 1) {
          console.log(`Request failed, retrying... (${attempt + 1}/${maxRetries})`)
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      
      throw error
    }
  }
  
  throw lastError
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp for monitoring
    config.metadata = { startTime: Date.now() }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    // Update connection state on successful response
    connectionState.isConnected = true
    connectionState.lastSuccessfulRequest = Date.now()
    connectionState.retryCount = 0
    
    // Log response time for monitoring
    if (response.config.metadata) {
      const responseTime = Date.now() - response.config.metadata.startTime
      if (responseTime > 5000) {
        console.warn(`Slow API response: ${response.config.url} took ${responseTime}ms`)
      }
    }
    
    return response
  },
  (error) => {
    if (!error.response) {
      connectionState.isConnected = false
      error.message = 'Connection lost. Attempting to reconnect...'
      
      // Attempt automatic reconnection for connection failures
      attemptReconnection().catch(() => {
        console.error('Failed to reconnect to backend')
      })
      
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      if (!error.config?.url?.includes('/auth/login') && 
          window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        connectionState.isConnected = false
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error)
  }
)

// Connection monitoring
setInterval(async () => {
  if (!connectionState.isConnected) {
    const isHealthy = await checkBackendHealth()
    if (isHealthy) {
      connectionState.isConnected = true
      connectionState.retryCount = 0
      window.dispatchEvent(new CustomEvent('backendReconnected'))
    }
  }
}, 10000) // Check every 10 seconds

// Export connection state for components to use
export const getConnectionState = () => ({ ...connectionState })

export const authAPI = {
  login: (email, password) => withRetry(() => api.post('/auth/login', { email, password })),
  verify: () => withRetry(() => api.get('/auth/verify'), 2),
  getProfile: () => withRetry(() => api.get('/auth/profile')),
}

export const studentsAPI = {
  getAll: (params) => withRetry(() => api.get('/students', { params })),
  getById: (id) => withRetry(() => api.get(`/students/${id}`)),
  create: (data) => withRetry(() => api.post('/students', data)),
  update: (id, data) => withRetry(() => api.put(`/students/${id}`, data)),
  delete: (id) => withRetry(() => api.delete(`/students/${id}`)),
  getRegistrations: (id) => withRetry(() => api.get(`/students/${id}/registrations`)),
  enrollInCourses: (id, courseIds) => withRetry(() => api.post(`/students/${id}/enroll`, { courseIds })),
  unenrollFromCourses: (id, registrationIds) => withRetry(() => api.post(`/students/${id}/unenroll`, { registrationIds })),
}

export const coursesAPI = {
  getAll: (params) => {
    const request = withRetry(() => api.get('/courses', { 
      params,
      timeout: 15000
    }))
    
    return request
  },
  getById: (id) => withRetry(() => api.get(`/courses/${id}`)),
  create: (data) => withRetry(() => api.post('/courses', data)),
  update: (id, data) => withRetry(() => api.put(`/courses/${id}`, data)),
  delete: (id) => withRetry(() => api.delete(`/courses/${id}`)),
  getRegistrations: (id) => withRetry(() => api.get(`/courses/${id}/registrations`)),
}

export const registrationsAPI = {
  getAll: (params) => withRetry(() => api.get('/registrations', { params })),
  create: (data) => withRetry(() => api.post('/registrations', data)),
  update: (id, data) => withRetry(() => api.put(`/registrations/${id}`, data)),
  delete: (id) => withRetry(() => api.delete(`/registrations/${id}`)),
}

export default api