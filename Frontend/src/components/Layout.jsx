import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  BookOpen, 
  Users, 
  ClipboardList, 
  User, 
  LogOut, 
  Menu, 
  X,
  GraduationCap,
  Settings,
  Heart,
  Mail,
  Phone,
  Github,
  ExternalLink,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Students', href: '/students', icon: Users },
  ]

    if (!showProfileModal) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          />
          <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Profile Settings</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="input pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="input"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowProfileModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                <Save className="h-4 w-4 mr-2" />
                Update Password
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
          <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Help & Support</h3>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h4>
                  <p className="text-gray-600 mb-6">We're here to assist you with any questions or issues.</p>
                </div>
                <div className="space-y-3">
                  <a
                    href="mailto:taskflowt@gmail.com?subject=Student Registration System - Support Request"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Email Support</div>
                      <div className="text-sm text-gray-500">taskflowt@gmail.com</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                  </a>
                  <a
                    href="https://github.com/your-repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Github className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">GitHub Repository</div>
                      <div className="text-sm text-gray-500">Report issues & contribute</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSupportModal(false)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SRS</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow glass-card border-r border-gray-200/50">
          <div className="flex items-center h-16 px-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold gradient-text">EduFlow</span>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-6 py-6 space-y-3">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'text-white' : 'group-hover:scale-110'
                  }`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  <span className="text-sm font-semibold text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-32 cursor-pointer hover:text-primary-600 transition-colors duration-200" onClick={() => setShowProfileMenu(!showProfileMenu)}>{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">{user?.role}</p>
              </div>
            </div>
            
            {/* Profile Menu */}
            {showProfileMenu && (
              <div className="mb-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Account Settings</h3>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      setShowProfileModal(true)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                  >
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      setShowSupportModal(true)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                  >
                    <Heart className="h-4 w-4 mr-3 text-gray-400" />
                    Help & Support
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
            >
              <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 glass-card border-b border-gray-200/50 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden hover:bg-gray-50 rounded-lg m-2"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center flex-1 px-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Student Portal</span>
              <span className="text-xs text-gray-500 ml-2">v2.0</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProfileModal />
      <SupportModal />
    </div>
  )
}

export default Layout