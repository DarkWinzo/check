import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.MODE === 'production' 
    ? '/api'  // Use relative path in production
    : 'http://localhost:5000/api'  // Use full URL in development
)

console.log('API Base URL:', API_BASE_URL)
console.log('Environment Mode:', import.meta.env.MODE)

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Add more specific error handling
    if (error.response?.status >= 500) {
      console.error('Server Error:', error.response.data)
    } else if (error.response?.status >= 400) {
      console.error('Client Error:', error.response.data)
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verify: () => api.get('/auth/verify'),
  getProfile: () => api.get('/auth/profile'),
}

// Students API
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getRegistrations: (id) => api.get(`/students/${id}/registrations`),
}

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getRegistrations: (id) => api.get(`/courses/${id}/registrations`),
}

// Registrations API
export const registrationsAPI = {
  getAll: (params) => api.get('/registrations', { params }),
  create: (data) => api.post('/registrations', data),
  update: (id, data) => api.put(`/registrations/${id}`, data),
  delete: (id) => api.delete(`/registrations/${id}`),
}

export default api