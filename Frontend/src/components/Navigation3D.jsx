import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap,
  Menu,
  X,
  Sparkles,
  Zap,
  Star,
  Globe
} from 'lucide-react'

const Navigation3D = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      color: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/50'
    },
    { 
      name: 'Students', 
      href: '/students', 
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/50'
    },
    { 
      name: 'Courses', 
      href: '/courses', 
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      glow: 'shadow-green-500/50'
    },
  ]

  useEffect(() => {
    const currentIndex = navigation.findIndex(item => item.href === location.pathname)
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0)
  }, [location.pathname])

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-2xl border-b border-white/10">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-32 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-96 h-32 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover:opacity-50 blur-lg transition-all duration-500 animate-pulse"></div>
                  <div className="relative p-3 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-500">
                    <GraduationCap className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <h1 className="text-2xl font-black text-white drop-shadow-lg">
                    <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                      Student Portal
                    </span>
                  </h1>
                  <p className="text-white/60 text-sm font-medium">Advanced Learning Management</p>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-2">
                {navigation.map((item, index) => {
                  const isActive = index === activeIndex
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="relative group"
                    >
                      <div className={`absolute -inset-2 bg-gradient-to-r ${item.color} rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500 ${isActive ? 'opacity-40' : ''}`}></div>
                      
                      <div className={`relative flex items-center space-x-3 px-6 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 ${
                        isActive 
                          ? `bg-gradient-to-r ${item.color} text-white border-white/30 shadow-2xl ${item.glow}` 
                          : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
                      }`}>
                        <item.icon className={`h-5 w-5 transition-all duration-500 ${isActive ? 'animate-pulse' : 'group-hover:rotate-12'}`} />
                        <span className="font-bold text-sm">{item.name}</span>
                        
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden relative group"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-30 group-hover:opacity-50 blur transition-all duration-300"></div>
                <div className="relative p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-sm bg-black/20 backdrop-blur-2xl border-r border-white/10 h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
            
            <div className="relative p-6 space-y-6">
              <div className="flex items-center space-x-4 pb-6 border-b border-white/10">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-50 blur"></div>
                  <div className="relative p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Student Portal</h2>
                  <p className="text-white/60 text-sm">Learning Management</p>
                </div>
              </div>

              <nav className="space-y-3">
                {navigation.map((item, index) => {
                  const isActive = index === activeIndex
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="relative group block"
                    >
                      <div className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-300 ${isActive ? 'opacity-40' : ''}`}></div>
                      
                      <div className={`relative flex items-center space-x-4 p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 ${
                        isActive 
                          ? `bg-gradient-to-r ${item.color} text-white border-white/30` 
                          : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                      }`}>
                        <item.icon className={`h-6 w-6 ${isActive ? 'animate-pulse' : ''}`} />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navigation3D