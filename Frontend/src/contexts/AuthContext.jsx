import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

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
  const [connectionStatus, setConnectionStatus] = useState('connected')

  useEffect(() => {
    checkAuthStatus()
    
    // Listen for backend reconnection events
    const handleReconnection = () => {
      setConnectionStatus('connected')
      toast.success('Connection restored!')
      checkAuthStatus()
    }
    
    window.addEventListener('backendReconnected', handleReconnection)
    
    return () => {
      window.removeEventListener('backendReconnected', handleReconnection)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      setConnectionStatus('checking')
      const token = localStorage.getItem('token')
      if (!token) {
        setConnectionStatus('connected')
        setLoading(false)
        return
      }

      const response = await authAPI.verify()
      setUser(response.data.user)
      setConnectionStatus('connected')
    } catch (error) {
      console.error('Auth verification failed:', error)
      
      if (!error.response) {
        setConnectionStatus('disconnected')
        // Don't remove token on connection errors, keep it for when connection is restored
      } else if (error.response?.status === 401) {
        localStorage.removeItem('token')
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('error')
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setConnectionStatus('connecting')
      const response = await authAPI.login(email, password)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      setConnectionStatus('connected')
      
      return { success: true }
    } catch (error) {
      if (!error.response) {
        setConnectionStatus('disconnected')
      } else {
        setConnectionStatus('connected')
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 
               (!error.response) ? 'Cannot connect to server. Please check your connection and try again.' :
               'Login failed. Please try again.' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setConnectionStatus('connected')
  }

  const value = {
    user,
    loading,
    connectionStatus,
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