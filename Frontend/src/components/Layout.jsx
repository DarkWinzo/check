import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut, 
  User, 
  ChevronDown,
  Menu,
  X,
  Home,
  Mail,
  Phone,
  Shield,
  Bell,
  Moon,
  Sun
} from 'lucide-react'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const profileMenuRef = useRef(null)

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' || location.pathname === '/' },
    { name: 'Students', href: '/students', icon: Users, current: location.pathname === '/students' },
    { name: 'Courses', href: '/courses', icon: BookOpen, current: location.pathname === '/courses' },
  ]

  const handleSignOut = async () => {
    try {
      logout()
      toast.success('Signed out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
    }
  }

  const handleHelpSupport = () => {
    const subject = encodeURIComponent('Student Registration System - Support Request')
    const body = encodeURIComponent(`Hello,

I need assistance with the Student Registration System.

User: ${user?.email}
Role: ${user?.role}
Current Page: ${location.pathname}

Please describe your issue here:

`)
    
    window.open(`mailto:taskflowt@gmail.com?subject=${subject}&body=${body}`, '_blank')
    toast.success('Opening email client for support')
  }

  const handleProfileSettings = () => {
    toast.success('Profile settings feature coming soon!')
    setShowProfileMenu(false)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    toast.success(`${darkMode ? 'Light' : 'Dark'} mode activated`)
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-lg sticky top-0 z-40 backdrop-blur-xl bg-opacity-95`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Student Portal
                    </span>
                  </h1>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Registration System
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-10 md:flex md:space-x-1">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      item.current
                        ? `${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'} shadow-lg`
                        : `${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side - User menu and mobile menu button */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                  darkMode 
                    ? 'text-yellow-400 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <button
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 relative ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${showProfileMenu ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                >
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} capitalize`}>
                      {user?.role || 'Student'}
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile dropdown menu */}
                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl z-50 animate-slide-in-up`}>
                    {/* Profile Header */}
                    <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                          <span className="text-xl font-bold text-white">
                            {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user?.email?.split('@')[0] || 'User'}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user?.email}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              user?.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              <Shield className="h-3 w-3 mr-1" />
                              {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || 'Student'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileSettings}
                        className={`w-full flex items-center px-6 py-3 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} transition-colors duration-200 group`}
                      >
                        <div className={`p-2 rounded-lg mr-3 ${darkMode ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors duration-200`}>
                          <Settings className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">Profile Settings</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Manage your account preferences
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleHelpSupport}
                        className={`w-full flex items-center px-6 py-3 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} transition-colors duration-200 group`}
                      >
                        <div className={`p-2 rounded-lg mr-3 ${darkMode ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors duration-200`}>
                          <HelpCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">Help & Support</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Get assistance and contact support
                          </div>
                        </div>
                      </button>

                      {/* Divider */}
                      <div className={`my-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>

                      {/* Contact Info */}
                      <div className="px-6 py-2">
                        <div className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-2`}>
                          Support Contact
                        </div>
                        <div className="space-y-1">
                          <div className={`flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Mail className="h-3 w-3 mr-2" />
                            taskflowt@gmail.com
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className={`my-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        className={`w-full flex items-center px-6 py-3 text-sm text-red-600 hover:bg-red-50 ${darkMode ? 'hover:bg-red-900/20' : ''} transition-colors duration-200 group`}
                      >
                        <div className="p-2 rounded-lg mr-3 bg-red-100 group-hover:bg-red-200 transition-colors duration-200">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">Sign Out</div>
                          <div className="text-xs text-red-500">
                            End your current session
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className={`p-2 rounded-xl ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors duration-200`}
                >
                  {showMobileMenu ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className={`md:hidden border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href)
                    setShowMobileMenu(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-xl text-base font-medium transition-colors duration-200 ${
                    item.current
                      ? `${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t mt-auto`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Student Registration System
              </span>
            </div>
            
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center md:text-right`}>
              <p>© 2025 DarkSide Developers Team. All rights reserved.</p>
              <p className="mt-1">
                Need help?{' '}
                <button
                  onClick={handleHelpSupport}
                  className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-medium transition-colors duration-200`}
                >
                  Contact Support
                </button>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout