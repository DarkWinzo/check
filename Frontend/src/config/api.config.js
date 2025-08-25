// API Configuration for Frontend
const getApiBaseUrl = () => {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // In production, use relative path
  if (import.meta.env.MODE === 'production') {
    return '/api'
  }
  
  // In development, detect current host and use appropriate backend URL
  const currentHost = window.location.hostname
  const apiPort = '5000'
  
  // Use the same host as frontend but with backend port
  return `http://${currentHost}:${apiPort}/api`
}

export const apiConfig = {
  // Base URL
  BASE_URL: getApiBaseUrl(),
  
  // Timeout
  TIMEOUT: 30000, // 30 seconds
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Retry Configuration
  RETRY: {
    ATTEMPTS: 3,
    DELAY: 1000 // 1 second
  },
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      VERIFY: '/auth/verify',
      PROFILE: '/auth/profile'
    },
    STUDENTS: {
      BASE: '/students',
      BY_ID: (id) => `/students/${id}`,
      REGISTRATIONS: (id) => `/students/${id}/registrations`
    },
    COURSES: {
      BASE: '/courses',
      BY_ID: (id) => `/courses/${id}`,
      REGISTRATIONS: (id) => `/courses/${id}/registrations`
    },
    REGISTRATIONS: {
      BASE: '/registrations',
      BY_ID: (id) => `/registrations/${id}`
    }
  }
}

export default apiConfig