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
  ChevronRight,
  Activity,
  BarChart3,
  TrendingUp,
  Calendar,
  Search,
  ChevronDown
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
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState([])

  React.useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error('Error loading notifications:', error)
        setNotifications([])
      }
    } else {
      const welcomeNotification = {
        id: Date.now(),
        title: 'Welcome to EduFlow Pro',
        message: `Welcome ${user?.email?.split('@')[0]}! Your account is ready to use.`,
        time: new Date().toISOString(),
        unread: true,
        type: 'success'
      }
      setNotifications([welcomeNotification])
      localStorage.setItem('notifications', JSON.stringify([welcomeNotification]))
    }
  }, [user])

  React.useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  const addNotification = (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      time: new Date().toISOString(),
      unread: true,
      type
    }
    setNotifications(prev => {
      const updated = [newNotification, ...prev.slice(0, 9)]
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  React.useEffect(() => {
    const handleSystemEvent = (event) => {
      if (event.detail) {
        addNotification(event.detail.title, event.detail.message, event.detail.type)
      }
    }

    window.addEventListener('systemNotification', handleSystemEvent)
    return () => window.removeEventListener('systemNotification', handleSystemEvent)
  }, [])

  const triggerNotification = (title, message, type = 'info') => {
    const event = new CustomEvent('systemNotification', {
      detail: { title, message, type }
    })
    window.dispatchEvent(event)
  }

  const handleUpdatePassword = async () => {
    if (!profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (profileData.newPassword !== profileData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (profileData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    try {
      setProfileLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Password updated successfully!')
      triggerNotification('Password Updated', 'Your password has been successfully changed', 'success')
      setShowProfileModal(false)
      setProfileData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPassword(false)
    } catch (error) {
      toast.error('Failed to update password. Please try again.')
      triggerNotification('Password Update Failed', 'There was an error updating your password', 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('notifications')
      setNotifications([])
      setShowProfileMenu(false)
      setShowProfileModal(false)
      setShowSupportModal(false)
      setShowNotifications(false)
      logout()
      navigate('/login')
      toast.success('Signed out successfully')
    }
  }

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      {
        const updated = prev.map(notif => 
          notif.id === id ? { ...notif, unread: false } : notif
        )
        localStorage.setItem('notifications', JSON.stringify(updated))
        return updated
      }
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, unread: false }))
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const deleteNotification = (id) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const clearAllNotifications = () => {
    setNotifications([])
    localStorage.removeItem('notifications')
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  const formatNotificationTime = (timeString) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }
  
  const unreadCount = notifications.filter(n => n.unread).length

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Activity,
      current: location.pathname === '/dashboard' || location.pathname === '/'
    },
    { 
      name: 'Courses', 
      href: '/courses', 
      icon: BookOpen,
      current: location.pathname === '/courses'
    },
    { 
      name: 'Students', 
      href: '/students', 
      icon: Users,
      current: location.pathname === '/students'
    },
  ]

  const ProfileModal = () => {
    if (!showProfileModal) return null

    return (
      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          />
          <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-gray-100 relative z-[71]">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <UserCog className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Profile Settings</h3>
                  <p className="text-sm text-gray-600">Manage your account preferences</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{user?.email}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 capitalize">{user?.role}</span>
                      {user?.role === 'admin' && <Crown className="h-4 w-4 text-yellow-500" />}
                      {user?.role === 'student' && <Star className="h-4 w-4 text-blue-500" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-lg font-bold text-gray-900 flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-gray-600" />
                  Security Settings
                </h5>
                
                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="input pr-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-2xl transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="input bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    placeholder="Confirm new password"
                  />
                </div>
                
                {profileData.newPassword && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">Password Strength:</div>
                    <div className="flex space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full ${
                            profileData.newPassword.length > i * 2 + 2
                              ? i < 2 ? 'bg-red-400' : i < 3 ? 'bg-yellow-400' : 'bg-green-400'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h5 className="text-lg font-bold text-gray-900 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-gray-600" />
                  Preferences
                </h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bell className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Notifications</span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only" />
                      <div className="relative">
                        <div className="w-10 h-6 bg-blue-500 rounded-full shadow-inner"></div>
                        <div className="absolute w-4 h-4 bg-white rounded-full shadow top-1 right-1 transition"></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Language</span>
                    </div>
                    <select className="w-full text-sm bg-white border border-gray-200 rounded-lg px-2 py-1">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            </div>
            <div className="flex items-center justify-end space-x-4 p-8 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowProfileModal(false)}
                className="btn btn-outline px-6 py-3"
                disabled={profileLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdatePassword}
                disabled={profileLoading}
                className="btn btn-primary px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {profileLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
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
      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowSupportModal(false)}
          />
          <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-gray-100 relative z-[71]">
            <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Help & Support</h3>
                  <p className="text-sm text-gray-600">We're here to help you succeed</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="space-y-8">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">Need Help?</h4>
                  <p className="text-gray-600 mb-8 text-lg">We're here to assist you with any questions or issues you might have.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <a
                    href="mailto:taskflowt@gmail.com?subject=Student Registration System - Support Request"
                    className="group relative p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="absolute top-4 right-4">
                      <ExternalLink className="h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors duration-200" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">Email Support</div>
                        <div className="text-sm text-gray-600 mb-2">taskflowt@gmail.com</div>
                        <div className="text-xs text-blue-600 font-medium">Get help within 24 hours</div>
                      </div>
                    </div>
                  </a>
                  
                  <button className="group relative p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">Live Chat</div>
                        <div className="text-sm text-gray-600 mb-2">Chat with our support team</div>
                        <div className="text-xs text-green-600 font-medium">Available 9 AM - 6 PM</div>
                      </div>
                    </div>
                  </button>
                  
                  <button className="group relative p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">Knowledge Base</div>
                        <div className="text-sm text-gray-600 mb-2">Browse our help articles</div>
                        <div className="text-xs text-purple-600 font-medium">Self-service support</div>
                      </div>
                    </div>
                  </button>
                  
                  <a
                    href="https://github.com/your-repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="absolute top-4 right-4">
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl shadow-lg">
                        <Github className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">GitHub Repository</div>
                        <div className="text-sm text-gray-600 mb-2">Report issues & contribute</div>
                        <div className="text-xs text-gray-600 font-medium">Open source project</div>
                      </div>
                    </div>
                  </a>
                </div>
                
                <div className="space-y-4">
                  <h5 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h5>
                  <div className="space-y-3">
                    {[
                      { q: "How do I reset my password?", a: "Use the 'Forgot Password' link on the login page or contact support." },
                      { q: "How do I enroll in a course?", a: "Navigate to the Courses page and click 'Register' on your desired course." },
                      { q: "Can I drop a course after enrolling?", a: "Yes, you can drop courses from your student dashboard or contact an administrator." }
                    ].map((faq, index) => (
                      <details key={index} className="group bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-200">
                        <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                          {faq.q}
                          <ChevronRight className="h-4 w-4 text-gray-400 group-open:rotate-90 transition-transform duration-200" />
                        </summary>
                        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-8 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Made with love by DarkSide Developers</span>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="btn btn-primary px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const NotificationModal = () => {
    if (!showNotifications) return null

    return (
      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />
          <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-gray-100 relative z-[71]">
            <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{unreadCount}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">{unreadCount} unread messages</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">You're all caught up!</p>
                </div>
              ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-2xl transition-all duration-200 ${
                      notification.unread
                        ? 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <h4 className={`font-semibold ${notification.unread ? 'text-blue-900' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatNotificationTime(notification.time)}</p>
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        {notification.unread && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Mark as read"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Delete notification"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 space-x-3">
              {notifications.length > 0 && (
                <>
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAllNotifications}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
                </>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="btn btn-primary px-6 py-3"
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
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm" />
        </div>
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-2xl border-r border-white/50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="text-white">
                <div className="text-xl font-black">EduFlow Pro</div>
                <div className="text-xs text-white/80 font-medium">Advanced Learning Platform</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  item.current
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-2xl scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 hover:text-gray-900 hover:shadow-xl'
                }`}
              >
                <div className={`p-2 rounded-xl mr-4 transition-all duration-300 ${
                  item.current 
                    ? 'bg-white/20 backdrop-blur-xl shadow-lg' 
                    : 'bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-100 group-hover:to-purple-100'
                }`}>
                  <item.icon className={`h-5 w-5 transition-all duration-300 ${
                    item.current ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                  }`} />
                </div>
                {item.name}
                {item.current && (
                  <div className="ml-auto flex items-center space-x-1">
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                )}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-200/50 p-6">
            <div className="relative">
              <div className="mb-4">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative w-full flex items-center p-4 rounded-2xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 group hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="relative">
                    <div className="p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl group-hover:from-yellow-200 group-hover:to-orange-200 transition-all duration-300">
                      <Bell className="h-5 w-5 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                        <span className="text-xs font-bold text-white">{unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <span className="ml-4 text-sm font-bold text-gray-700 group-hover:text-orange-700 transition-colors duration-300">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <div className="ml-auto">
                      <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
                    </div>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center w-full p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 transition-all duration-300 group shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <div className="flex-shrink-0">
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                    <span className="text-lg font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="ml-4 flex-1 text-left">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize font-medium flex items-center">
                    {user?.role}
                    {user?.role === 'admin' && <Crown className="h-3 w-3 ml-1 text-yellow-500" />}
                    {user?.role === 'student' && <Star className="h-3 w-3 ml-1 text-blue-500" />}
                  </p>
                </div>
                <div className="ml-2">
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-all duration-300 ${showProfileMenu ? 'rotate-90 text-blue-500' : 'group-hover:text-blue-500'}`} />
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 z-[80] overflow-hidden animate-fade-in">
                  <div className="p-3">
                    <button
                      onClick={() => {
                        setShowProfileModal(true)
                        setShowProfileMenu(false)
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm font-bold text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <div className="p-2 bg-blue-100 rounded-xl mr-3 shadow-sm">
                        <Settings className="h-4 w-4 text-blue-600" />
                      </div>
                      Profile Settings
                      <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                    </button>
                    <button
                      onClick={() => {
                        setShowSupportModal(true)
                        setShowProfileMenu(false)
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm font-bold text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <div className="p-2 bg-green-100 rounded-xl mr-3 shadow-sm">
                        <Heart className="h-4 w-4 text-green-600" />
                      </div>
                      Help & Support
                      <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                    </button>
                    <div className="border-t border-gray-200 my-3 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-600 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <div className="p-2 bg-red-100 rounded-xl mr-3 shadow-sm">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      Sign out
                      <div className="ml-auto flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-red-400" />
                        <span className="text-xs text-red-500 font-medium">Secure</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-2xl border-b border-gray-200/50 shadow-lg">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowNotifications(true)}
                className="relative p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <span className="text-xs font-bold text-white">{Math.min(unreadCount, 9)}</span>
                  </div>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-bold text-gray-900">
                      {user?.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-500 capitalize flex items-center">
                      {user?.role}
                      {user?.role === 'admin' && <Crown className="h-3 w-3 ml-1 text-yellow-500" />}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <ProfileModal />
      <SupportModal />
      <NotificationModal />

      {showProfileMenu && (
        <div
          className="fixed inset-0 z-[60]"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  )
}

export default Layout