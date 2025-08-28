import React, { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ProfileModal from './ProfileModal'
import SupportModal from './SupportModal'
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
  EyeOff,
  Shield,
  Bell,
  HelpCircle,
  MessageCircle,
  FileText,
  Lock,
  UserCog,
  Palette,
  Globe,
  Zap,
  Star,
  Award,
  Crown,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)

  // Handle profile menu actions
  const handleProfileSettings = () => {
    console.log('Profile Settings clicked')
    setShowProfileMenu(false)
    setShowProfileModal(true)
  }

  const handleHelpSupport = () => {
    console.log('Help & Support clicked')
    setShowProfileMenu(false)
    setShowSupportModal(true)
  }

  const handleSignOut = () => {
    console.log('Sign Out clicked')
    setShowProfileMenu(false)
    if (window.confirm('Are you sure you want to sign out?')) {
      logout()
      toast.success('Successfully signed out!')
      navigate('/login')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Students', href: '/students', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-[70] lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
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
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-black gradient-text">EduFlow Pro</span>
                <p className="text-xs text-gray-500 font-medium">Advanced Learning Platform</p>
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
                  className={`flex items-center px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-2xl transform scale-105'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-gray-900 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <Icon className={`mr-4 h-5 w-5 transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
                  }`} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto">
                      <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200/50 p-6">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center w-full p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="flex-shrink-0">
                  <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                </div>
                <div className="ml-4 flex-1 text-left">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize font-medium flex items-center">
                    {user?.role}
                    {user?.role === 'admin' && <Crown className="h-3 w-3 ml-1 text-yellow-500" />}
                    {user?.role === 'student' && <Star className="h-3 w-3 ml-1 text-blue-500" />}
                  </p>
                </div>
                <div className="ml-2">
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {/* Profile dropdown */}
              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 z-50 overflow-hidden animate-slide-in-up">
                  <div className="p-2">
                    {/* Profile Settings Button */}
                    <button
                      onClick={handleProfileSettings}
                      className="group flex items-center w-full px-5 py-4 text-sm font-bold text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="p-2.5 bg-gradient-to-r from-blue-100 to-purple-100 group-hover:from-white/20 group-hover:to-white/20 rounded-xl mr-4 transition-all duration-300">
                        <Settings className="h-5 w-5 text-blue-600 group-hover:text-white transition-all duration-300" />
                      </div>
                      <span className="font-bold group-hover:text-white transition-colors duration-300">Profile Settings</span>
                    </button>
                    
                    {/* Help & Support Button */}
                    <button
                      onClick={handleHelpSupport}
                      className="group flex items-center w-full px-5 py-4 text-sm font-bold text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="p-2.5 bg-gradient-to-r from-green-100 to-emerald-100 group-hover:from-white/20 group-hover:to-white/20 rounded-xl mr-4 transition-all duration-300">
                        <HelpCircle className="h-5 w-5 text-green-600 group-hover:text-white transition-all duration-300" />
                      </div>
                      <span className="font-bold group-hover:text-white transition-colors duration-300">Help & Support</span>
                    </button>
                    
                    {/* Divider */}
                    <div className="my-2 mx-4">
                      <div className="border-t border-gray-200"></div>
                    </div>
                    
                    {/* Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      className="group flex items-center w-full px-5 py-4 text-sm font-bold text-red-600 rounded-2xl hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="p-2.5 bg-gradient-to-r from-red-100 to-pink-100 group-hover:from-white/20 group-hover:to-white/20 rounded-xl mr-4 transition-all duration-300">
                        <LogOut className="h-5 w-5 text-red-600 group-hover:text-white transition-all duration-300" />
                      </div>
                      <span className="font-bold group-hover:text-white transition-colors duration-300">Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">SRS</span>
            </div>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      <SupportModal 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />

      {/* Click outside handler for profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  )
}

export default Layout