import axios from 'axios'

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
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = 'Connection failed. Please check if the backend server is running on port 5000.';
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      if (!error.config?.url?.includes('/auth/login') && 
          window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verify: () => api.get('/auth/verify'),
  getProfile: () => api.get('/auth/profile'),
}

export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getRegistrations: (id) => api.get(`/students/${id}/registrations`),
  enrollInCourses: (id, courseIds) => api.post(`/students/${id}/enroll`, { courseIds }),
  unenrollFromCourses: (id, registrationIds) => api.post(`/students/${id}/unenroll`, { registrationIds }),
}

export const coursesAPI = {
  getAll: (params) => {
    return api.get('/courses', { 
      params,
      timeout: 45000,
    }).catch(async (error) => {
      if (!error.response && error.config && !error.config.__isRetryRequest) {
        error.config.__isRetryRequest = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        return api.request(error.config);
      }
      throw error;
    });
  },
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getRegistrations: (id) => api.get(`/courses/${id}/registrations`),
}

export const registrationsAPI = {
  getAll: (params) => api.get('/registrations', { params }),
  create: (data) => api.post('/registrations', data),
  update: (id, data) => api.put(`/registrations/${id}`, data),
  delete: (id) => api.delete(`/registrations/${id}`),
}

export default api