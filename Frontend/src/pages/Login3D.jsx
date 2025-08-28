import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { 
  GraduationCap, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Star,
  Sparkles,
  Zap,
  Globe,
  Shield,
  Crown,
  Heart
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const Login3D = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await login(data.email, data.password)
      
      if (result.success) {
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-white/20 rounded-lg rotate-45 animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 border border-white/20 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            
            <div className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 hover:bg-black/30 transition-all duration-500">
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-6 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse blur-xl"></div>
                  
                  <div className="relative w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-500 group">
                    <GraduationCap className="h-12 w-12 text-white drop-shadow-2xl" />
                    
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce shadow-xl">
                      <Crown className="h-4 w-4 text-white m-1" />
                    </div>
                    <div className="absolute -bottom-1 -left-2 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse shadow-xl">
                      <Heart className="h-2 w-2 text-white m-1" />
                    </div>
                    <div className="absolute top-1 -right-4 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping shadow-xl">
                      <Sparkles className="h-1 w-1 text-white m-1" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-5xl font-black text-white mb-4">
                    <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl">
                      Welcome Back
                    </span>
                  </h1>
                  <p className="text-white/80 text-xl font-semibold">
                    Continue your learning journey
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-white/90 mb-3">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-40 transition duration-500 blur"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-6 w-6 text-white/50 group-focus-within:text-cyan-400 transition-colors duration-300" />
                      </div>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Please enter a valid email address'
                          }
                        })}
                        type="email"
                        className="w-full h-16 pl-14 pr-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 hover:bg-white/15 text-lg font-medium"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-300 flex items-center mt-3 animate-fade-in">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-white/90 mb-3">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-focus-within:opacity-40 transition duration-500 blur"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-6 w-6 text-white/50 group-focus-within:text-purple-400 transition-colors duration-300" />
                      </div>
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full h-16 pl-14 pr-16 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/15 text-lg font-medium"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/10 rounded-r-2xl transition-colors duration-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-6 w-6 text-white/50 hover:text-white/80" />
                        ) : (
                          <Eye className="h-6 w-6 text-white/50 hover:text-white/80" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-300 flex items-center mt-3 animate-fade-in">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-cyan-400 bg-white/10 border-white/30 rounded focus:ring-cyan-400 focus:ring-2 transition-all duration-200"
                    />
                    <span className="ml-3 text-sm text-white/70 group-hover:text-white/90 transition-colors duration-200 font-medium">
                      Remember me
                    </span>
                  </label>

                  <a href="#" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full h-16 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-black rounded-2xl shadow-2xl hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 active:scale-95 overflow-hidden text-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-3" />
                        <span className="text-xl">Signing you in...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-xl">Sign In</span>
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-white/60">
                  Need assistance?{' '}
                  <a 
                    href="mailto:taskflowt@gmail.com?subject=Student Registration System - Support Request"
                    className="font-bold text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 text-white/40">
                  <Sparkles className="h-4 w-4" />
                </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <p className="text-sm text-white/50 font-semibold">
                Copyright © 2025{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-black">
                  DarkSide Developers Team
                </span>
              </p>
              
              <p className="text-xs text-white/30 font-medium">
                Crafted with passion & innovation
              </p>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Globe className="h-4 w-4 text-white/20 animate-spin" style={{ animationDuration: '3s' }} />
                <Shield className="h-4 w-4 text-white/30 animate-pulse" />
                <Star className="h-4 w-4 text-white/20 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login3D