import axios from 'axios'

// More robust API URL detection
const getApiBaseUrl = () => {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, use relative path
  if (import.meta.env.MODE === 'production') {
    return '/api';
  }
  
  // In development, try to detect the correct localhost
  const currentHost = window.location.hostname;
  const apiPort = '5000';
  
  if (currentHost === '127.0.0.1' || currentHost === 'localhost') {
    return `http://${currentHost}:${apiPort}/api`;
  }
  
  // Fallback
  return 'http://localhost:5000/api';
}

const API_BASE_URL = getApiBaseUrl();

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
      message: error.message,
      baseURL: API_BASE_URL
    })
    
    // Handle network errors more gracefully
    if (error.code === 'ERR_NETWORK' || error.code === 'NETWORK_ERROR') {
      console.error('Network Error - API might be down:', API_BASE_URL);
      // Don't redirect on network errors
      return Promise.reject(error);
    }
    
    // Handle CORS errors
    if (error.message?.includes('CORS') || error.response?.status === 0) {
      console.error('CORS Error - Check backend CORS configuration');
      return Promise.reject(error);
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Only redirect if not already on login page and not a login attempt
      if (!error.config?.url?.includes('/auth/login') && 
          window.location.pathname !== '/login') {
        console.log('Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Add more specific error handling
    if (error.response?.status >= 500) {
      console.error('Server Error:', error.response.data)
    } else if (error.response?.status >= 400) {
      console.error('Client Error:', error.response.data)
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network Error:', error.message)
      // Don't redirect on network errors, let components handle gracefully
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