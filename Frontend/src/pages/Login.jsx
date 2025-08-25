import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, Eye, EyeOff, Mail, Lock, ArrowRight, Star, Heart, Zap, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () => {
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
      console.log('Login form submitted:', { email: data.email });
      const result = await login(data.email, data.password)
      
      if (result.success) {
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else {
        console.error('Login failed:', result.error);
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Login form error:', error);
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-white/20 rounded-lg rotate-45 animate-pulse"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 border border-white/20 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="relative group">
            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Main card */}
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 hover:bg-white/15 transition-all duration-500">
              {/* Header */}
              <div className="text-center mb-8">
                {/* Logo with enhanced effects */}
                <div className="relative inline-block mb-6">
                  <div className="relative">
                    {/* Outer glow ring */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
                    
                    {/* Main logo container */}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-500 group">
                      <GraduationCap className="h-10 w-10 text-white drop-shadow-lg" />
                      
                      {/* Floating particles */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce shadow-lg"></div>
                      <div className="absolute -bottom-1 -left-2 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
                      <div className="absolute top-1 -right-3 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping shadow-lg"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                      Welcome Back
                    </span>
                  </h1>
                  <p className="text-white/70 text-lg font-medium">
                    Continue your learning journey
                  </p>
                  <div className="flex items-center justify-center space-x-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-30 transition duration-300 blur"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-white/50 group-focus-within:text-cyan-400 transition-colors duration-300" />
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
                        className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 hover:bg-white/15"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-300 flex items-center mt-2 animate-fade-in">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-focus-within:opacity-30 transition duration-300 blur"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white/50 group-focus-within:text-purple-400 transition-colors duration-300" />
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
                        className="w-full h-14 pl-12 pr-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/15"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/10 rounded-r-2xl transition-colors duration-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-white/50 hover:text-white/80" />
                        ) : (
                          <Eye className="h-5 w-5 text-white/50 hover:text-white/80" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-300 flex items-center mt-2 animate-fade-in">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-cyan-400 bg-white/10 border-white/30 rounded focus:ring-cyan-400 focus:ring-2 transition-all duration-200"
                    />
                    <span className="ml-3 text-sm text-white/70 group-hover:text-white/90 transition-colors duration-200">
                      Remember me
                    </span>
                  </label>

                  <a href="#" className="text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full h-14 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold rounded-2xl shadow-2xl hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-3" />
                        <span className="text-lg">Signing you in...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">Sign In</span>
                        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-white/60">
                  Need assistance?{' '}
                  <a 
                    href="mailto:taskflowt@gmail.com?subject=Student Registration System - Support Request&body=Hello,%0D%0A%0D%0AI need assistance with the Student Registration System.%0D%0A%0D%0APlease describe your issue here..."
                    className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Beautiful Footer */}
          <div className="mt-8 text-center">
            <div className="relative">
              {/* Decorative line */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-4 text-white/40">
                  ✦
                </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <p className="text-sm text-white/50 font-medium">
                Copyright © 2025{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-bold">
                  DarkSide Developers Team
                </span>
              </p>
              
              <p className="text-xs text-white/30">
                Crafted with passion & innovation
              </p>
              
              <div className="flex items-center justify-center space-x-1 mt-3">
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login