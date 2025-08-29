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
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      checkAuthStatus()
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setInitialized(true)
        setLoading(false)
        return
      }

      const response = await authAPI.verify()
      setUser(response.data.user)
      setInitialized(true)
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
      setInitialized(true)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      setInitialized(true)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 
               (!error.response) ? 'Cannot connect to server. Please check if the backend is running on port 5000.' :
               'Login failed. Please try again.' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setInitialized(true)
  }

  const value = {
    user,
    loading,
    initialized,
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