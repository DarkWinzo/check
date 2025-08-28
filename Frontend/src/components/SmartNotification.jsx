import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Zap,
  Star,
  Sparkles
} from 'lucide-react'

const SmartNotification = () => {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const notificationTypes = {
    success: {
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bg: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30'
    },
    warning: {
      icon: AlertTriangle,
      color: 'from-yellow-500 to-orange-500',
      bg: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30'
    },
    info: {
      icon: Info,
      color: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30'
    },
    system: {
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      bg: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/30'
    }
  }

  useEffect(() => {
    const sampleNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Course Registration Complete',
        message: 'Successfully enrolled in Advanced Mathematics',
        time: '2 minutes ago',
        read: false
      },
      {
        id: 2,
        type: 'info',
        title: 'New Assignment Available',
        message: 'Physics Lab Report due next week',
        time: '1 hour ago',
        read: false
      },
      {
        id: 3,
        type: 'system',
        title: 'System Update',
        message: 'New features have been added to your dashboard',
        time: '3 hours ago',
        read: true
      }
    ]
    
    setNotifications(sampleNotifications)
    setUnreadCount(sampleNotifications.filter(n => !n.read).length)

    const handleSystemNotification = (event) => {
      const { title, message, type = 'info' } = event.detail
      const newNotification = {
        id: Date.now(),
        type,
        title,
        message,
        time: 'Just now',
        read: false
      }
      
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
    }

    window.addEventListener('systemNotification', handleSystemNotification)
    return () => window.removeEventListener('systemNotification', handleSystemNotification)
  }, [])

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const removeNotification = (id) => {
    const notification = notifications.find(n => n.id === id)
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-500"></div>
        
        <div className="relative p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110">
          <Bell className="h-6 w-6" />
          
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 max-h-96 overflow-hidden z-50">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur"></div>
            
            <div className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                    <h3 className="text-lg font-bold text-white">Notifications</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-white/60 hover:text-white transition-colors duration-200"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {notifications.map((notification) => {
                      const config = notificationTypes[notification.type]
                      const IconComponent = config.icon
                      
                      return (
                        <div
                          key={notification.id}
                          className={`relative group p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                            notification.read 
                              ? 'bg-white/5 border-white/10' 
                              : `bg-gradient-to-r ${config.bg} ${config.border}`
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color} shadow-lg`}>
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-semibold ${notification.read ? 'text-white/80' : 'text-white'}`}>
                                  {notification.title}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeNotification(notification.id)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-white/80 transition-all duration-200"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              
                              <p className={`text-xs mt-1 ${notification.read ? 'text-white/60' : 'text-white/80'}`}>
                                {notification.message}
                              </p>
                              
                              <p className="text-xs text-white/40 mt-2">
                                {notification.time}
                              </p>
                            </div>
                            
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-2xl flex items-center justify-center">
                      <Bell className="h-8 w-8 text-white/40" />
                    </div>
                    <h3 className="text-white/80 font-semibold mb-2">No notifications</h3>
                    <p className="text-white/60 text-sm">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartNotification