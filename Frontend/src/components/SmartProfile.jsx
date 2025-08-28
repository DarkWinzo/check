import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Shield, 
  Star,
  Crown,
  Zap,
  Heart,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react'

const SmartProfile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.profile-container')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleProfileSettings = () => {
    setIsOpen(false)
    setShowProfileModal(true)
  }

  const handleHelpSupport = () => {
    setIsOpen(false)
    setShowSupportModal(true)
  }

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      setIsLoggingOut(true)
      setIsOpen(false)
      
      setTimeout(() => {
        logout()
        navigate('/login')
      }, 1000)
    }
  }

  const ProfileModal = () => {
    if (!showProfileModal) return null

    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          />
          
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur"></div>
            
            <div className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
              
              <div className="relative p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Profile Settings</h3>
                  </div>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="relative p-6 space-y-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <span className="text-2xl font-bold text-white">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-1">{user?.email}</h4>
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-white/80 capitalize">{user?.role} Account</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                    <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                    <div className="text-white font-semibold">{user?.email}</div>
                  </div>
                  
                  <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                    <label className="block text-sm font-medium text-white/80 mb-2">Account Type</label>
                    <div className="flex items-center space-x-2">
                      <div className="text-white font-semibold capitalize">{user?.role}</div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative p-6 border-t border-white/10">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const SupportModal = () => {
    if (!showSupportModal) return null

    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSupportModal(false)}
          />
          
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl opacity-30 blur"></div>
            
            <div className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-emerald-600/10 to-teal-600/10"></div>
              
              <div className="relative p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Help & Support</h3>
                  </div>
                  <button
                    onClick={() => setShowSupportModal(false)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="relative p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <Heart className="h-8 w-8 text-green-400 animate-pulse" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Need Help?</h4>
                  <p className="text-white/80">We're here to assist you with any questions or issues.</p>
                </div>

                <div className="space-y-3">
                  <a 
                    href="mailto:taskflowt@gmail.com?subject=Student Registration System - Support Request"
                    className="flex items-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl">📧</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">Email Support</div>
                      <div className="text-sm text-white/60">taskflowt@gmail.com</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/80 transition-colors duration-300" />
                  </a>
                </div>
              </div>
              
              <div className="relative p-6 border-t border-white/10">
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative profile-container">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all duration-500"></div>
          
          <div className="relative flex items-center space-x-3 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold">{user?.email}</div>
              <div className="text-xs text-white/60 capitalize">{user?.role}</div>
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 z-50">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur"></div>
              
              <div className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
                
                <div className="relative p-6">
                  <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-white/10">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="text-lg font-bold text-white">
                          {user?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                      <p className="text-xs text-white/60 capitalize flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        {user?.role} Account
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleProfileSettings}
                      className="group relative w-full flex items-center px-4 py-3 text-sm font-semibold text-white rounded-2xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center w-full">
                        <div className="p-2 bg-blue-500/20 group-hover:bg-white/20 rounded-xl mr-3 transition-all duration-300">
                          <Settings className="h-4 w-4 text-blue-400 group-hover:text-white transition-all duration-300 group-hover:rotate-180" />
                        </div>
                        <span className="flex-1 text-left">Profile Settings</span>
                        <Sparkles className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </button>

                    <button
                      onClick={handleHelpSupport}
                      className="group relative w-full flex items-center px-4 py-3 text-sm font-semibold text-white rounded-2xl hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center w-full">
                        <div className="p-2 bg-green-500/20 group-hover:bg-white/20 rounded-xl mr-3 transition-all duration-300">
                          <HelpCircle className="h-4 w-4 text-green-400 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                        </div>
                        <span className="flex-1 text-left">Help & Support</span>
                        <Heart className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                      </div>
                    </button>

                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>

                    <button
                      onClick={handleSignOut}
                      disabled={isLoggingOut}
                      className="group relative w-full flex items-center px-4 py-3 text-sm font-semibold text-white rounded-2xl hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center w-full">
                        <div className="p-2 bg-red-500/20 group-hover:bg-white/20 rounded-xl mr-3 transition-all duration-300">
                          {isLoggingOut ? (
                            <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin group-hover:border-white"></div>
                          ) : (
                            <LogOut className="h-4 w-4 text-red-400 group-hover:text-white transition-all duration-300 group-hover:rotate-12" />
                          )}
                        </div>
                        <span className="flex-1 text-left">
                          {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                        </span>
                        <Zap className="w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <Star className="h-3 w-3 text-yellow-400 animate-pulse" />
                      <span>DarkSide Developers Team</span>
                      <Star className="h-3 w-3 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProfileModal />
      <SupportModal />
    </>
  )
}

export default SmartProfile