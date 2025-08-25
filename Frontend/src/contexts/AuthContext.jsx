import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      console.log('Checking auth status with token:', token ? 'present' : 'missing');
      const response = await authAPI.verify()
      console.log('Auth verification successful:', response.data);
      setUser(response.data.user)
    } catch (error) {
      console.error('Auth check failed:', error.message);
      
      // Only log detailed errors if it's not a network error
      if (error.response) {
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }
      
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email)
      console.log('API Base URL:', import.meta.env.VITE_API_URL || 'default');
      const response = await authAPI.login(email, password)
      console.log('Login response:', response.data)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      
      return { success: true }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 
               (error.code === 'ERR_NETWORK' || !error.response) ? 'Cannot connect to server. Please check if the backend is running on port 5000.' :
               'Login failed. Please try again.' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}