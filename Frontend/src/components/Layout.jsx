import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Menu, 
  X, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  Mail,
  Phone,
  Shield,
  Bell,
  Search,
  Home,
  GraduationCap
} from 'lucide-react'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close dropdown when route changes
  useEffect(() => {
    setProfileDropdownOpen(false)
  }, [location.pathname])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' || location.pathname === '/' },
    { name: 'Students', href: '/students', icon: Users, current: location.pathname === '/students' },
    { name: 'Courses', href: '/courses', icon: BookOpen, current: location.pathname === '/courses' },
  ]

  const handleSignOut = async () => {
    try {
      setProfileDropdownOpen(false)
      logout()
      toast.success('Signed out successfully!')
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
    }
  }

  const handleProfileSettings = () => {
    setProfileDropdownOpen(false)
    // For now, show a toast. You can implement a profile settings modal later
    toast.success('Profile settings coming soon!')
  }

  const handleHelpSupport = () => {
    setProfileDropdownOpen(false)
    // Open email client with pre-filled support email
    const subject = encodeURIComponent('Student Registration System - Support Request')
    const body = encodeURIComponent(`Hello,

I need assistance with the Student Registration System.

User: ${user?.email}
Role: ${user?.role}
Current Page: ${location.pathname}

Please describe your issue here:

`)
    
    const mailtoLink = `mailto:taskflowt@gmail.com?subject=${subject}&body=${body}`
    window.open(mailtoLink, '_blank')
    toast.success('Opening email client for support...')
  }

  const getUserInitials = () => {
    if (user?.email) {
      const emailParts = user.email.split('@')[0].split('.')
      if (emailParts.length >= 2) {
        return (emailParts[0].charAt(0) + emailParts[1].charAt(0)).toUpperCase()
      }
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (user?.email) {
      const emailParts = user.email.split('@')[0]
      return emailParts.charAt(0).toUpperCase() + emailParts.slice(1).replace(/[._]/g, ' ')
    }
    return 'User'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">EduSystem</h1>
              <p className="text-xs text-gray-500">Student Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href)
                  setSidebarOpen(false)
                }}
                className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                    item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        {/* User info in sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="hidden sm:block">
                <h2 className="text-xl font-bold text-gray-900">
                  {location.pathname === '/dashboard' || location.pathname === '/' ? 'Dashboard' :
                   location.pathname === '/students' ? 'Students' :
                   location.pathname === '/courses' ? 'Courses' : 'Page'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <span className="text-sm font-bold text-white">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role === 'admin' ? 'Administrator' : 'Student'}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-slide-in-up">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-white">
                            {getUserInitials()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-xs text-gray-500 truncate flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user?.email}
                          </p>
                          <div className="flex items-center mt-1">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user?.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              <Shield className="h-3 w-3 mr-1" />
                              {user?.role === 'admin' ? 'Administrator' : 'Student'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileSettings}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 group"
                      >
                        <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors duration-200">
                          <Settings className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">Profile Settings</div>
                          <div className="text-xs text-gray-500">Manage your account preferences</div>
                        </div>
                      </button>

                      <button
                        onClick={handleHelpSupport}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 group"
                      >
                        <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-green-100 transition-colors duration-200">
                          <HelpCircle className="h-4 w-4 text-gray-600 group-hover:text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">Help & Support</div>
                          <div className="text-xs text-gray-500">Get assistance and contact support</div>
                        </div>
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors duration-200 group"
                        >
                          <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors duration-200">
                            <LogOut className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">Sign Out</div>
                            <div className="text-xs text-red-500">End your current session</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout