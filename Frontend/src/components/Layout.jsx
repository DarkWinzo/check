import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  User,
  Mail,
  Shield,
  Bell,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false)
  }, [location])

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard' || location.pathname === '/'
    },
    {
      name: 'Students',
      href: '/students',
      icon: Users,
      current: location.pathname === '/students'
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: BookOpen,
      current: location.pathname === '/courses'
    }
  ]

  const handleSignOut = async () => {
    try {
      setShowUserMenu(false)
      logout()
      toast.success('Signed out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
    }
  }

  const handleProfileSettings = () => {
    setShowUserMenu(false)
    toast.success('Profile settings feature coming soon!')
    // TODO: Navigate to profile settings page when implemented
    // navigate('/profile/settings')
  }

  const handleHelpSupport = () => {
    setShowUserMenu(false)
    // Open email client with pre-filled support request
    const subject = encodeURIComponent('Student Registration System - Support Request')
    const body = encodeURIComponent(`Hello,

I need assistance with the Student Registration System.

User: ${user?.email}
Role: ${user?.role}
Current Page: ${location.pathname}

Please describe your issue here:


Best regards,
${user?.email?.split('@')[0]}`)
    
    window.open(`mailto:taskflowt@gmail.com?subject=${subject}&body=${body}`, '_blank')
    toast.success('Opening email client for support request')
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    const email = user.email
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  const getUserDisplayName = () => {
    if (!user?.email) return 'User'
    const emailPart = user.email.split('@')[0]
    return emailPart.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center space-x-3 mr-8">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Student Portal
                  </h1>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      item.current
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Bell className="h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-slide-in-up">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <span className="text-lg font-bold text-white">
                            {getUserInitials()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-sm text-gray-500 truncate flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user?.email}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <Shield className="h-3 w-3 mr-1" />
                            <span className="capitalize">{user?.role} Account</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileSettings}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Settings className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">Profile Settings</div>
                          <div className="text-xs text-gray-500">Manage your account</div>
                        </div>
                      </button>

                      <button
                        onClick={handleHelpSupport}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                      >
                        <div className="p-2 bg-green-100 rounded-lg">
                          <HelpCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">Help & Support</div>
                          <div className="text-xs text-gray-500">Get assistance</div>
                        </div>
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                        >
                          <div className="p-2 bg-red-100 rounded-lg">
                            <LogOut className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">Sign Out</div>
                            <div className="text-xs text-red-500">End your session</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                {showMobileMenu ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-600">
                © 2025 Student Registration System
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <button
                onClick={handleHelpSupport}
                className="hover:text-gray-700 transition-colors duration-200"
              >
                Support
              </button>
              <span>•</span>
              <span>Made with ❤️ by DarkSide Developers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout