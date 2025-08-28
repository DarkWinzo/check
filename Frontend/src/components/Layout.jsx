import React, { useState, useRef } from 'react'
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
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState([])
  const profileMenuRef = useRef(null)

  // Load notifications from localStorage on mount
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
      // Initialize with welcome notification for new users
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

  // Save notifications to localStorage when they change
  React.useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  // Add new notification function
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
      const updated = [newNotification, ...prev.slice(0, 9)] // Keep only 10 notifications
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  // Listen for system events to create notifications
  React.useEffect(() => {
    const handleSystemEvent = (event) => {
      if (event.detail) {
        addNotification(event.detail.title, event.detail.message, event.detail.type)
      }
    }

    window.addEventListener('systemNotification', handleSystemEvent)
    return () => window.removeEventListener('systemNotification', handleSystemEvent)
  }, [])

  // Function to trigger system notifications
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
      // Simulate password update with proper validation
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
    try {
      console.log('Logout function called')
      if (window.confirm('Are you sure you want to sign out?')) {
        console.log('User confirmed logout')
        // Clear notifications on logout
        localStorage.removeItem('notifications')
        setNotifications([])
        setShowProfileMenu(false)
        setShowProfileModal(false)
        setShowSupportModal(false)
        setShowNotifications(false)
        
        console.log('Calling logout function...')
        logout()
        toast.success('Signed out successfully')
        
        console.log('Navigating to login...')
        setTimeout(() => {
          navigate('/login')
        }, 500)
      } else {
        console.log('User cancelled logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error during logout')
    }
  }

  // Handle profile menu actions
  const handleProfileSettings = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Profile Settings clicked')
    setShowProfileMenu(false)
    setShowProfileModal(true)
    toast.success('Opening Profile Settings...')
  }

  const handleHelpSupport = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Help & Support clicked')
    setShowProfileMenu(false)
    setShowSupportModal(true)
    toast.success('Opening Help & Support...')
  }

  const handleSignOut = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Sign Out clicked')
    
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        setIsLoggingOut(true)
        setShowProfileMenu(false)
        toast.success('Signing out...')
        
        // Add a small delay for better UX
        setTimeout(() => {
          logout()
          toast.success('Successfully signed out!')
        }, 500)
      } catch (error) {
        console.error('Logout error:', error)
        toast.error('Error signing out')
        setIsLoggingOut(false)
      }
    } else {
      setShowProfileMenu(false)
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
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Students', href: '/students', icon: Users },
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
              {/* User Info Section */}
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

              {/* Settings Tabs */}
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
                
                {/* Password Strength Indicator */}
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
              
              {/* Additional Settings */}
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
            {/* Enhanced Header */}
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
                {/* Welcome Section */}
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
                
                {/* Support Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Support */}
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
                  
                  {/* Live Chat */}
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
                  
                  {/* Knowledge Base */}
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
                  
                  {/* GitHub Repository */}
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
                
                {/* FAQ Section */}
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
            {/* Header */}
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
            
            {/* Notifications List */}
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
            
            {/* Footer */}
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
              {/* Notifications Button */}
              <div className="mb-4">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative w-full flex items-center p-4 rounded-2xl hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 group hover:scale-105"
                >
                  <div className="relative">
                    <Bell className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors duration-300" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-xs font-bold text-white">{unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-700 group-hover:text-orange-700 transition-colors duration-300">
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
                className="flex items-center w-full p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-105 relative z-20 cursor-pointer active:scale-95 transform hover:-translate-y-1"
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
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 z-[100] overflow-hidden animate-fade-in transform scale-100 origin-bottom">
                  <div className="p-2">
                    {/* Profile Settings Button */}
                    <button
                      onClick={() => {
                        console.log('Profile Settings clicked')
                        setShowProfileModal(true)
                        setShowProfileMenu(false)
                      }}
                      className="group flex items-center w-full px-5 py-4 text-sm font-bold text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95 transform hover:-translate-y-1 relative overflow-hidden"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      
                      <div className="relative p-2.5 bg-gradient-to-r from-blue-100 to-purple-100 group-hover:from-white/20 group-hover:to-white/20 rounded-xl mr-4 transition-all duration-300 group-hover:scale-110">
                        <Settings className="h-5 w-5 text-blue-600 group-hover:text-white transition-all duration-300 group-hover:rotate-90" />
                      </div>
                      <span className="relative font-bold group-hover:text-white transition-colors duration-300">Profile Settings</span>
                      <div className="relative ml-auto flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </button>
                    
                    {/* Help & Support Button */}
                    <button
                      onClick={() => {
                        console.log('Help & Support clicked')
                        setShowSupportModal(true)
                        setShowProfileMenu(false)
                      }}
                      className="group flex items-center w-full px-5 py-4 text-sm font-bold text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95 transform hover:-translate-y-1 relative overflow-hidden"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      
                      <div className="relative p-2.5 bg-gradient-to-r from-green-100 to-emerald-100 group-hover:from-white/20 group-hover:to-white/20 rounded-xl mr-4 transition-all duration-300 group-hover:scale-110">
                        <Heart className="h-5 w-5 text-green-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 animate-pulse" />
                      </div>
                      <span className="relative font-bold group-hover:text-white transition-colors duration-300">Help & Support</span>
                      <div className="relative ml-auto flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </button>
                    
                    {/* Elegant Divider */}
                    <div className="relative my-3 mx-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    
                    {/* Sign Out Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Sign out clicked')
                        setShowProfileMenu(false)
                        handleLogout()
                      }}
                      className="group flex items-center w-full px-5 py-4 text-sm font-bold text-red-600 rounded-2xl hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95 transform hover:-translate-y-1 relative overflow-hidden"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      
                      <div className="relative p-2.5 bg-gradient-to-r from-red-100 to-pink-100 group-hover:from-white/20 group-hover:to-white/20 rounded-xl mr-4 transition-all duration-300 group-hover:scale-110">
                        <LogOut className="h-5 w-5 text-red-600 group-hover:text-white transition-all duration-300 group-hover:-rotate-12" />
                      </div>
                      <span className="relative font-bold group-hover:text-white transition-colors duration-300">Sign out</span>
                      <div className="ml-auto flex items-center space-x-1">
                        <div className="relative flex items-center space-x-1">
                          <Shield className="h-3 w-3 text-red-400 group-hover:text-white/80 transition-colors duration-300" />
                          <span className="text-xs text-red-500 group-hover:text-white/80 font-medium transition-colors duration-300">Secure</span>
                        </div>
                      </div>
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-500 hover:text-gray-600"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{Math.min(unreadCount, 9)}</span>
                  </div>
                )}
              </button>
            </div>
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
      <ProfileModal />
      <SupportModal />
      <NotificationModal />

      {/* Click outside handler for profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowProfileMenu(false)
          }}
        />
      )}
    </div>
  )
}

export default Layout