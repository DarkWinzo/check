import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { studentsAPI, coursesAPI, registrationsAPI } from '../services/api'
import { 
  Users, 
  BookOpen, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  Sparkles
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    studentsPerCourse: 0
  })
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'admin') {
        const [studentsRes, coursesRes, registrationsRes] = await Promise.all([
          studentsAPI.getAll({ limit: 100 }),
          coursesAPI.getAll({ limit: 100 }),
          registrationsAPI.getAll({ limit: 1000 })
        ])

        const totalStudents = studentsRes.data.pagination.totalCount
        const totalCourses = coursesRes.data.pagination.totalCount
        const totalRegistrations = registrationsRes.data.pagination.totalCount
        
        // Calculate average students per course
        const studentsPerCourse = totalCourses > 0 ? Math.round(totalRegistrations / totalCourses * 10) / 10 : 0

        setStats({
          totalStudents,
          totalCourses,
          studentsPerCourse
        })
      } else {
        // For students, show limited stats
        const coursesRes = await coursesAPI.getAll({ limit: 20 })
        setStats({
          totalCourses: coursesRes.data.pagination.totalCount,
          studentsPerCourse: 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bgGradient }) => (
    <div className={`relative overflow-hidden rounded-2xl ${bgGradient} p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group`}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="absolute inset-0 bg-white rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
        
        <div className="text-3xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
          {loading ? <LoadingSpinner size="sm" /> : value}
        </div>
        <div className="text-white/80 text-sm font-medium">{title}</div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div className="h-full bg-white/40 rounded-full" style={{ width: '70%' }}></div>
      </div>
    </div>
  )

  if (loading && Object.values(stats).every(val => val === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-fade-in">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
          <div className="absolute inset-0 bg-white rounded-full transform translate-x-32 -translate-y-32 animate-float"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10">
          <div className="absolute inset-0 bg-white rounded-full transform -translate-x-16 translate-y-16 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10 p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    Welcome back, {user?.email?.split('@')[0]}! 👋
                  </h1>
                  <p className="text-white/80 text-lg mt-1">
                    {user?.role === 'admin' ? 'System Administrator' : 'Student Portal'}
                  </p>
                </div>
              </div>
              <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
                {user?.role === 'admin' 
                  ? 'Monitor your institution\'s performance and manage student registrations.'
                  : 'Explore courses, track your progress, and manage your academic journey.'
                }
              </p>
            </div>
            
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-2xl font-bold mb-1">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-white/80 text-sm">
                  {currentTime.toLocaleDateString([], { 
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {user?.role === 'admin' ? (
          <>
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={Users}
              trend="up"
              trendValue="12"
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              title="Total Courses"
              value={stats.totalCourses}
              icon={BookOpen}
              trend="up"
              trendValue="8"
              color="bg-gradient-to-r from-green-500 to-green-600"
              bgGradient="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatCard
              title="Students per Course"
              value={stats.studentsPerCourse}
              icon={TrendingUp}
              trend="up"
              trendValue="5"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Available Courses"
              value={stats.totalCourses}
              icon={BookOpen}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              title="My Registrations"
              value="0"
              icon={Users}
              color="bg-gradient-to-r from-green-500 to-green-600"
              bgGradient="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatCard
              title="Completed Courses"
              value="0"
              icon={TrendingUp}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </>
        )}
      </div>

      {/* Welcome Message */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {user?.role === 'admin' ? 'System Overview' : 'Your Academic Journey'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {user?.role === 'admin' 
            ? 'Use the navigation menu to manage students, courses, and view detailed reports. The statistics above provide a quick overview of your institution\'s current status.'
            : 'Navigate through the menu to explore available courses, manage your registrations, and track your academic progress. Your learning journey starts here!'
          }
        </p>
      </div>
    </div>
  )
}

export default Dashboard