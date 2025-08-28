import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  HelpCircle,
  Mail,
  Github,
  Shield,
  Bell,
  Search,
  ChevronDown,
  Activity,
  Home
} from 'lucide-react'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' || location.pathname === '/' },
    { name: 'Students', href: '/students', icon: Users, current: location.pathname === '/students' },
    { name: 'Courses', href: '/courses', icon: BookOpen, current: location.pathname === '/courses' },
  ]

  const handleLogout = () => {
    setShowLogoutConfirm(true)
    setProfileMenuOpen(false)
  }

  const confirmLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
    setShowLogoutConfirm(false)
  }

  const ProfileModal = () => {
    if (!showProfileModal) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          />
          <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
                  <p className="text-sm text-gray-600">Manage your account information</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {user?.email?.split('@')[0]}
                    </h4>
                    <p className="text-sm text-gray-500">{user?.role}</p>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1">
                      Change Avatar
                    </button>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 cursor-not-allowed capitalize"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.email?.split('@')[0] || ''}
                      className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter display name"
                    />
                  </div>
                </div>

                {/* Security Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h5 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </h5>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                      <div className="font-medium text-gray-900">Change Password</div>
                      <div className="text-sm text-gray-500">Update your account password</div>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                      <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Add an extra layer of security</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Profile updated successfully!')
                  setShowProfileModal(false)
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const SupportModal = () => {
    if (!showSupportModal) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowSupportModal(false)}
          />
          <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Help & Support</h3>
                  <p className="text-sm text-gray-600">Get assistance and developer information</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Developer Information */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Developer Information
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Developer Profile */}
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">DW</span>
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-gray-900">DarkWinzo</h5>
                        <p className="text-sm text-gray-600">Full Stack Developer</p>
                        <p className="text-xs text-gray-500">Student Registration System</p>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 gap-3">
                      <a
                        href="mailto:taskflowt@gmail.com?subject=Student Registration System - Support Request&body=Hello DarkWinzo,%0D%0A%0D%0AI need assistance with the Student Registration System.%0D%0A%0D%0APlease describe your issue here..."
                        className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg transition-colors duration-200">
                          <Mail className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Email Support</div>
                          <div className="text-sm text-gray-600">taskflowt@gmail.com</div>
                        </div>
                      </a>

                      <a
                        href="https://github.com/DarkWinzo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-colors duration-200">
                          <Github className="h-4 w-4 text-gray-700" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">GitHub Profile</div>
                          <div className="text-sm text-gray-600">github.com/DarkWinzo</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Quick Help */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Help</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <h5 className="font-semibold text-blue-900 mb-2">Getting Started</h5>
                      <p className="text-sm text-blue-700">
                        New to the system? Check out our quick start guide to learn the basics.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <h5 className="font-semibold text-green-900 mb-2">Common Issues</h5>
                      <p className="text-sm text-green-700">
                        Having trouble? Most issues can be resolved by refreshing the page or checking your internet connection.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <h5 className="font-semibold text-purple-900 mb-2">Feature Requests</h5>
                      <p className="text-sm text-purple-700">
                        Have an idea for improvement? Contact the developer with your suggestions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">System Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Version:</span>
                      <span className="ml-2 font-medium">v1.0.0</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Build:</span>
                      <span className="ml-2 font-medium">2025.01</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium text-green-600">Operational</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Uptime:</span>
                      <span className="ml-2 font-medium">99.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const LogoutConfirmModal = () => {
    if (!showLogoutConfirm) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl shadow-lg">
                  <LogOut className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
                  <p className="text-sm text-gray-600">Are you sure you want to sign out?</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl flex items-center justify-center">
                  <LogOut className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h4>
                <p className="text-gray-600 mb-6">
                  You will be logged out of your account and redirected to the login page. Any unsaved changes will be lost.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-600 hover:to-orange-700 transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Student Portal</h1>
                <p className="text-xs text-gray-600">Registration System</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </button>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Search bar */}
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 h-10 pl-10 pr-4 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile dropdown menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-slide-in-up">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <span className="text-lg font-bold text-white">
                            {user?.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user?.email?.split('@')[0]}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize mt-1">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileModal(true)
                          setProfileMenuOpen(false)
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Profile Settings
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowSupportModal(true)
                          setProfileMenuOpen(false)
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                      >
                        <HelpCircle className="h-4 w-4 mr-3" />
                        Help & Support
                      </button>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
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

      {/* Modals */}
      <ProfileModal />
      <SupportModal />
      <LogoutConfirmModal />

      {/* Click outside to close profile menu */}
      {profileMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setProfileMenuOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout