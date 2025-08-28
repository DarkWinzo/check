import React from 'react'
import Navigation3D from './Navigation3D'
import SmartNotification from './SmartNotification'
import SmartProfile from './SmartProfile'

const Layout3D = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <Navigation3D />
      
      <div className="relative z-10 pt-20">
        <div className="absolute top-4 right-6 flex items-center space-x-4 z-20">
          <SmartNotification />
          <SmartProfile />
        </div>
        
        <main className="relative">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-xl"></div>
              <div className="relative bg-black/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout3D