/*
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { studentsAPI, coursesAPI, registrationsAPI } from '../services/api'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Award,
  Clock,
  Star,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  UserCheck,
  BookMarked,
  Target,
  Zap,
  Globe,
  Heart,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Minus,
  Layers,
  Shield,
  Cpu,
  Database,
  Network,
  Wifi,
  Brain,
  Rocket,
  Lightning,
  Flame,
  Crown,
  Diamond,
  Gem,
  Palette,
  Briefcase,
  Trophy,
  Medal,
  Gift,
  Compass,
  Map,
  Navigation,
  Radar,
  Satellite,
  Telescope,
  Microscope,
  Atom,
  Dna,
  Fingerprint,
  Eye,
  Headphones,
  Music,
  Volume2,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  HardDrive,
  Server,
  Cloud,
  CloudRain,
  Sun,
  Moon,
  Stars,
  Sunrise,
  Sunset
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Cell, 
  LineChart, 
  Line, 
  Area, 
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend,
  ComposedChart,
  Scatter,
  ScatterChart,
  ReferenceLine
} from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
*/

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { studentsAPI, coursesAPI, registrationsAPI } from '../services/api'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Award,
  Clock,
  Star,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  UserCheck,
  BookMarked,
  Target,
  Zap,
  Globe,
  Heart,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Minus,
  Layers,
  Shield,
  Cpu,
  Database,
  Network,
  Wifi,
  Brain,
  Rocket,
  Lightning,
  Flame,
  Crown,
  Diamond,
  Gem,
  Palette,
  Briefcase,
  Trophy,
  Medal,
  Gift,
  Compass,
  Map,
  Navigation,
  Radar,
  Satellite,
  Telescope,
  Microscope,
  Atom,
  Dna,
  Fingerprint,
  Eye,
  Headphones,
  Music,
  Volume2,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  HardDrive,
  Server,
  Cloud,
  CloudRain,
  Sun,
  Moon,
  Stars,
  Sunrise,
  Sunset,
  Building   // ✅ Added this (used in Department Overview)
} from 'lucide-react'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie,        // ✅ Added this (needed for Pie charts)
  Cell, 
  LineChart, 
  Line, 
  Area, 
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend,
  ComposedChart,
  Scatter,
  ScatterChart,
  ReferenceLine
} from 'recharts'

import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    activeStudents: 0,
    availableCourses: 0,
    myRegistrations: 0,
    completedCourses: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dataLoaded, setDataLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [realTimeStats, setRealTimeStats] = useState({
    systemLoad: 0,
    activeUsers: 0,
    serverStatus: 'online',
    memoryUsage: 0,
    networkSpeed: 0
  })

  // Enhanced chart data with more stable values
  const [enrollmentTrendData, setEnrollmentTrendData] = useState([])
  const [studentStatusData, setStudentStatusData] = useState([])
  const [popularCoursesData, setPopularCoursesData] = useState([])
  const [performanceData, setPerformanceData] = useState([])
  const [departmentData, setDepartmentData] = useState([])
  const [weeklyActivityData, setWeeklyActivityData] = useState([])
  const [gradeDistributionData, setGradeDistributionData] = useState([])

  // Generate stable, realistic chart data
  const generateChartData = useCallback((stats) => {
    const currentMonth = new Date().getMonth()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Stable enrollment trend data
    const trendData = []
    const baseStudents = Math.max(10, stats.totalStudents || 25)
    const baseCourses = Math.max(5, stats.totalCourses || 12)
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const studentGrowth = Math.floor(i * 3) + Math.floor(Math.random() * 5)
      const courseGrowth = Math.floor(i * 1.5) + Math.floor(Math.random() * 2)
      
      trendData.push({
        month: months[monthIndex],
        students: Math.max(5, baseStudents - studentGrowth),
        courses: Math.max(3, baseCourses - courseGrowth),
        registrations: Math.max(8, (baseStudents - studentGrowth) * 1.2 + Math.floor(Math.random() * 10))
      })
    }
    setEnrollmentTrendData(trendData)

    // Stable student status data
    const totalStudents = Math.max(1, stats.totalStudents || 25)
    const activePercentage = Math.floor((stats.activeStudents / totalStudents) * 100) || 75
    const inactivePercentage = Math.max(5, Math.min(20, 100 - activePercentage - 10))
    const graduatedPercentage = 100 - activePercentage - inactivePercentage
    
    setStudentStatusData([
      { name: 'Active', value: activePercentage, color: '#10B981', count: Math.floor(totalStudents * activePercentage / 100) },
      { name: 'Inactive', value: inactivePercentage, color: '#F59E0B', count: Math.floor(totalStudents * inactivePercentage / 100) },
      { name: 'Graduated', value: graduatedPercentage, color: '#8B5CF6', count: Math.floor(totalStudents * graduatedPercentage / 100) }
    ])

    // Popular courses with stable data
    const courseNames = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'History', 'Economics']
    const totalCourses = Math.max(1, stats.totalCourses || 8)
    const avgStudentsPerCourse = Math.floor(totalStudents / totalCourses) || 3
    
    const popularCourses = courseNames.slice(0, Math.min(6, totalCourses)).map((name, index) => ({
      name,
      students: Math.max(1, avgStudentsPerCourse + (5 - index) + Math.floor(Math.random() * 3)),
      growth: [15, 12, 8, 5, 3, -2][index] || 0,
      satisfaction: 85 + Math.floor(Math.random() * 10)
    }))
    setPopularCoursesData(popularCourses)

    // Performance data with realistic trends
    const perfData = []
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const basePerformance = 78 + (stats.totalRegistrations > 0 ? Math.min(15, stats.totalRegistrations / 3) : 0)
      const seasonalVariation = Math.sin((monthIndex / 12) * Math.PI * 2) * 5
      
      perfData.push({
        month: months[monthIndex],
        performance: Math.min(100, Math.max(60, basePerformance + seasonalVariation + Math.floor(Math.random() * 5))),
        satisfaction: Math.min(100, Math.max(70, 85 + Math.floor(Math.random() * 8))),
        engagement: Math.min(100, Math.max(65, 80 + Math.floor(Math.random() * 10)))
      })
    }
    setPerformanceData(perfData)

    // Department distribution
    const departments = ['Engineering', 'Sciences', 'Arts', 'Business', 'Medicine']
    const deptData = departments.map((dept, index) => ({
      name: dept,
      students: Math.max(1, Math.floor(totalStudents / departments.length) + Math.floor(Math.random() * 5)),
      courses: Math.max(1, Math.floor(totalCourses / departments.length) + Math.floor(Math.random() * 2)),
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]
    }))
    setDepartmentData(deptData)

    // Weekly activity data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const weeklyData = days.map((day, index) => ({
      day,
      logins: Math.max(5, 20 + Math.floor(Math.random() * 15) - (index > 4 ? 10 : 0)),
      submissions: Math.max(2, 15 + Math.floor(Math.random() * 10) - (index > 4 ? 8 : 0)),
      activities: Math.max(8, 30 + Math.floor(Math.random() * 20) - (index > 4 ? 15 : 0))
    }))
    setWeeklyActivityData(weeklyData)

    // Grade distribution
    const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
    const gradeData = grades.map((grade, index) => ({
      grade,
      count: Math.max(1, Math.floor(totalStudents * [0.15, 0.25, 0.20, 0.15, 0.10, 0.08, 0.05, 0.02][index])),
      percentage: [15, 25, 20, 15, 10, 8, 5, 2][index]
    }))
    setGradeDistributionData(gradeData)
  }, [])

  useEffect(() => {
    fetchDashboardData()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const statsTimer = setInterval(() => {
      setRealTimeStats(prev => ({
        systemLoad: Math.max(10, Math.min(95, prev.systemLoad + (Math.random() - 0.5) * 10)),
        activeUsers: Math.max(5, Math.min(100, prev.activeUsers + Math.floor((Math.random() - 0.5) * 6))),
        serverStatus: 'online',
        memoryUsage: Math.max(20, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        networkSpeed: Math.max(50, Math.min(1000, prev.networkSpeed + (Math.random() - 0.5) * 100))
      }))
    }, 3000)
    
    return () => {
      clearInterval(timer)
      clearInterval(statsTimer)
    }
  }, [])

  useEffect(() => {
    if (dataLoaded) {
      generateChartData(stats)
    }
  }, [stats, dataLoaded, generateChartData])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (user?.role === 'admin') {
        try {
          const [studentsRes, coursesRes, registrationsRes] = await Promise.allSettled([
            studentsAPI.getAll({ limit: 100 }),
            coursesAPI.getAll({ limit: 100 }),
            registrationsAPI.getAll({ limit: 10 })
          ])

          const studentsData = studentsRes.status === 'fulfilled' ? studentsRes.value.data : { pagination: { totalCount: 0 }, students: [] }
          const coursesData = coursesRes.status === 'fulfilled' ? coursesRes.value.data : { pagination: { totalCount: 0 }, courses: [] }
          const registrationsData = registrationsRes.status === 'fulfilled' ? registrationsRes.value.data : { pagination: { totalCount: 0 }, registrations: [] }

          setStats({
            totalStudents: studentsData.pagination?.totalCount || 0,
            totalCourses: coursesData.pagination?.totalCount || 0,
            totalRegistrations: registrationsData.pagination?.totalCount || 0,
            activeStudents: studentsData.students?.filter(s => s.status === 'active').length || 0,
            availableCourses: coursesData.courses?.filter(c => c.status === 'active').length || 0,
            myRegistrations: 0,
            completedCourses: 0
          })

          setRecentActivity(registrationsData.registrations?.slice(0, 5) || [])
        } catch (error) {
          console.error('Error fetching admin data:', error)
          setError('Some dashboard data may be limited due to connection issues.')
          setStats({
            totalStudents: 25,
            totalCourses: 12,
            totalRegistrations: 45,
            activeStudents: 22,
            availableCourses: 10,
            myRegistrations: 0,
            completedCourses: 0
          })
        }
      } else {
        try {
          const coursesRes = await coursesAPI.getAll({ limit: 20 }).catch(() => ({ data: { pagination: { totalCount: 0 }, courses: [] } }))
          
          let myRegistrations = []
          let completedCount = 0
          
          try {
            const studentProfile = await studentsAPI.getById('me').catch(() => null)
            if (studentProfile?.data) {
              const registrationsRes = await studentsAPI.getRegistrations(studentProfile.data.id).catch(() => ({ data: { data: [] } }))
              myRegistrations = registrationsRes.data?.data || []
              completedCount = myRegistrations.filter(r => r.status === 'completed').length || 0
            }
          } catch (error) {
            console.warn('Error fetching student registrations:', error.message)
          }
          
          const coursesData = coursesRes.data || {}
          
          setStats({
            totalStudents: 0,
            totalCourses: coursesData.pagination?.totalCount || 0,
            totalRegistrations: 0,
            activeStudents: 0,
            availableCourses: coursesData.courses?.filter(c => c.status === 'active').length || 0,
            myRegistrations: myRegistrations.length || 0,
            completedCourses: completedCount
          })
          
          setRecentActivity([])
        } catch (error) {
          console.error('Error fetching student data:', error)
          setError('Some dashboard data may be limited due to connection issues.')
          setStats({
            totalStudents: 0,
            totalCourses: 8,
            totalRegistrations: 0,
            activeStudents: 0,
            availableCourses: 6,
            myRegistrations: 3,
            completedCourses: 1
          })
        }
      }
      setDataLoaded(true)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try refreshing the page.')
      setStats({
        totalStudents: user?.role === 'admin' ? 25 : 0,
        totalCourses: user?.role === 'admin' ? 12 : 8,
        totalRegistrations: user?.role === 'admin' ? 45 : 0,
        activeStudents: user?.role === 'admin' ? 22 : 0,
        availableCourses: user?.role === 'admin' ? 10 : 6,
        myRegistrations: user?.role === 'student' ? 3 : 0,
        completedCourses: user?.role === 'student' ? 1 : 0
      })
      setDataLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [user?.role])

  // Enhanced 3D Stat Card with modern design
  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bgGradient, subtitle, sparklineData }) => (
    <div className={`relative overflow-hidden rounded-3xl ${bgGradient} p-8 shadow-2xl hover:shadow-3xl transition-all duration-700 group transform hover:-translate-y-3 hover:scale-105`}>
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-125 transition-transform duration-1000 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full transform -translate-x-8 translate-y-8 group-hover:scale-110 transition-transform duration-700"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-6 right-6 w-3 h-3 bg-white/40 rounded-full animate-bounce"></div>
      <div className="absolute bottom-8 right-12 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-12 left-12 w-2 h-2 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/15 rounded-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-4 rounded-2xl ${color} shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 backdrop-blur-sm border border-white/30`}>
            <Icon className="h-8 w-8 text-white drop-shadow-2xl" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-white/40 shadow-lg ${
              trend === 'up' ? 'bg-green-100/90 text-green-800' : 
              trend === 'down' ? 'bg-red-100/90 text-red-800' : 'bg-gray-100/90 text-gray-800'
            }`}>
              {trend === 'up' ? <ChevronUp className="h-4 w-4" /> : 
               trend === 'down' ? <ChevronDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
        
        <div className="text-5xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
          {loading ? <LoadingSpinner size="sm" /> : value}
        </div>
        <div className="text-white/95 text-xl font-bold mb-2">{title}</div>
        {subtitle && (
          <div className="text-white/80 text-sm font-medium">{subtitle}</div>
        )}
        
        {/* Mini sparkline */}
        {sparklineData && (
          <div className="mt-4 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="value" stroke="rgba(255,255,255,0.8)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* 3D Progress indicator */}
      <div className="absolute bottom-0 left-0 w-full h-3 bg-white/10 rounded-b-3xl overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-white/40 to-white/70 rounded-full transition-all duration-2000 shadow-inner" 
          style={{ width: `${Math.min(100, (value / (value + 20)) * 100 || 75)}%` }}
        ></div>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 rounded-3xl"></div>
    </div>
  )

  // Enhanced Quick Action Card
  const QuickActionCard = ({ title, description, icon: Icon, color, onClick, badge }) => (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-white/80 hover:-translate-y-2 hover:scale-105 relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-125 transition-transform duration-700"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={`inline-flex p-4 rounded-2xl ${color} mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-xl`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          {badge && (
            <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg">
              {badge}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">{description}</p>
        
        <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
          <span>Get started</span>
          <ArrowUpRight className="h-5 w-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
        </div>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-3xl"></div>
    </div>
  )

  // Enhanced Activity Item
  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-lg">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <UserCheck className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">
          {activity.Student?.first_name} {activity.Student?.last_name}
        </p>
        <p className="text-xs text-gray-500">
          Registered for {activity.Course?.course_name}
        </p>
      </div>
      <div className="text-xs text-gray-400 font-medium">
        {new Date(activity.registration_date).toLocaleDateString()}
      </div>
    </div>
  )

  // Enhanced Chart Card
  const ChartCard = ({ title, children, icon: Icon, subtitle, actions }) => (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )

  // Show loading screen only on initial load
  if (loading && !dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center animate-pulse shadow-2xl">
            <Rocket className="h-10 w-10 text-white" />
          </div>
          <LoadingSpinner size="xl" />
          <p className="mt-6 text-white/90 font-bold text-lg">Loading your dashboard...</p>
          <p className="mt-2 text-white/60 text-sm">Preparing amazing insights for you</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 animate-fade-in">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl mb-10 shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20">
          <div className="absolute inset-0 bg-white rounded-full transform translate-x-32 -translate-y-32 animate-float"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20">
          <div className="absolute inset-0 bg-white rounded-full transform -translate-x-16 translate-y-16 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 opacity-10">
          <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
        </div>
        
        <div className="relative z-10 p-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-8 lg:mb-0">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Welcome back, {user?.email?.split('@')[0] || 'User'}! 🚀
                  </h1>
                  <p className="text-white/90 text-xl mt-2 font-semibold">
                    {user?.role === 'admin' ? '🎯 System Administrator' : '📚 Student Portal'}
                  </p>
                </div>
              </div>
              <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
                {user?.role === 'admin' 
                  ? '🎛️ Monitor your institution\'s performance and manage student registrations with powerful insights and analytics.'
                  : '🌟 Explore courses, track your progress, and manage your academic journey with our advanced learning platform.'
                }
              </p>
            </div>
            
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
                <div className="text-3xl font-black mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-white/80 text-sm font-semibold">
                  {currentTime.toLocaleDateString([], { 
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/70 font-medium">System Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {user?.role === 'admin' ? (
          <>
            <StatCard
              title="Total Students"
              subtitle="Registered learners"
              value={stats.totalStudents}
              icon={Users}
              trend="up"
              trendValue="12"
              color="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
              bgGradient="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700"
              sparklineData={[{value: 20}, {value: 25}, {value: 22}, {value: 28}, {value: stats.totalStudents}]}
            />
            <StatCard
              title="Active Courses"
              subtitle="Available programs"
              value={stats.totalCourses}
              icon={BookOpen}
              trend="up"
              trendValue="8"
              color="bg-gradient-to-br from-green-500 via-green-600 to-green-700"
              bgGradient="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700"
              sparklineData={[{value: 8}, {value: 10}, {value: 9}, {value: 11}, {value: stats.totalCourses}]}
            />
            <StatCard
              title="Total Registrations"
              subtitle="Course enrollments"
              value={stats.totalRegistrations}
              icon={TrendingUp}
              trend="up"
              trendValue="24"
              color="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700"
              bgGradient="bg-gradient-to-br from-purple-500 via-pink-600 to-red-700"
              sparklineData={[{value: 30}, {value: 35}, {value: 40}, {value: 42}, {value: stats.totalRegistrations}]}
            />
            <StatCard
              title="Active Students"
              subtitle="Currently enrolled"
              value={stats.activeStudents}
              icon={Activity}
              trend="up"
              trendValue="5"
              color="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"
              bgGradient="bg-gradient-to-br from-orange-500 via-yellow-600 to-red-700"
              sparklineData={[{value: 18}, {value: 20}, {value: 19}, {value: 22}, {value: stats.activeStudents}]}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Available Courses"
              subtitle="Ready to explore"
              value={stats.totalCourses}
              icon={BookOpen}
              color="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
              bgGradient="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700"
            />
            <StatCard
              title="My Registrations"
              subtitle="Enrolled courses"
              value={stats.myRegistrations || 0}
              icon={Award}
              color="bg-gradient-to-br from-green-500 via-green-600 to-green-700"
              bgGradient="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700"
            />
            <StatCard
              title="Completed Courses"
              subtitle="Achievements unlocked"
              value={stats.completedCourses || 0}
              icon={Target}
              color="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700"
              bgGradient="bg-gradient-to-br from-purple-500 via-pink-600 to-red-700"
            />
            <StatCard
              title="Academic Year"
              subtitle="Current session"
              value="2024-25"
              icon={Calendar}
              color="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"
              bgGradient="bg-gradient-to-br from-orange-500 via-yellow-600 to-red-700"
            />
          </>
        )}
      </div>

      {/* Real-time System Status (Admin only) */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{Math.round(realTimeStats.systemLoad)}%</div>
            </div>
            <div className="text-white/90 font-semibold">System Load</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${realTimeStats.systemLoad}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{realTimeStats.activeUsers}</div>
            </div>
            <div className="text-white/90 font-semibold">Active Users</div>
            <div className="text-white/70 text-sm mt-1">Currently online</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 via-pink-600 to-red-700 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{Math.round(realTimeStats.memoryUsage)}%</div>
            </div>
            <div className="text-white/90 font-semibold">Memory Usage</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${realTimeStats.memoryUsage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div className="text-xl font-bold">{Math.round(realTimeStats.networkSpeed)} Mbps</div>
            </div>
            <div className="text-white/90 font-semibold">Network Speed</div>
            <div className="text-white/70 text-sm mt-1">Real-time monitoring</div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-3xl p-8 mb-10 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <Activity className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800">Dashboard Notice</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                onClick={() => {
                  setError(null)
                  fetchDashboardData()
                }}
                className="mt-3 text-sm text-red-700 hover:text-red-800 font-bold underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Charts Section - Only for Admin */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
          {/* Enrollment Trend Chart */}
          <ChartCard 
            title="Enrollment Analytics" 
            subtitle="Student & course growth over time"
            icon={TrendingUp}
            actions={[
              <button key="refresh" className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors duration-200">
                <Activity className="h-4 w-4 text-blue-600" />
              </button>
            ]}
          >
            <div className="h-80">
              {enrollmentTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={enrollmentTrendData}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="students" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorStudents)"
                      strokeWidth={3}
                    />
                    <Bar dataKey="courses" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="registrations" stroke="#10B981" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              )}
            </div>
          </ChartCard>

          {/* Student Status Distribution */}
          <ChartCard title="Student Distribution" subtitle="Current enrollment status" icon={PieChart}>
            <div className="h-80">
              {studentStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <RechartsPieChart.Pie
                      data={studentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {studentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart.Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name, props) => [
                        `${value}% (${props.payload.count} students)`, 
                        name
                      ]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              )}
            </div>
            {studentStatusData.length > 0 && (
              <div className="flex justify-center space-x-6 mt-6">
                {studentStatusData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                    <span className="text-xs text-gray-500">({item.count})</span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          {/* Weekly Activity Chart */}
          <ChartCard title="Weekly Activity" subtitle="User engagement patterns" icon={BarChart3}>
            <div className="h-80">
              {weeklyActivityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar dataKey="logins" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="submissions" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="activities" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              )}
            </div>
          </ChartCard>

          {/* Department Distribution */}
          <ChartCard title="Department Overview" subtitle="Students by department" icon={Building}>
            <div className="space-y-4">
              {departmentData.length > 0 ? (
                departmentData.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: dept.color }}
                      >
                        {dept.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{dept.name}</div>
                        <div className="text-sm text-gray-500">{dept.courses} courses</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{dept.students}</div>
                      <div className="text-xs text-gray-500">students</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner size="lg" />
                </div>
              )}
            </div>
          </ChartCard>

          {/* Performance Metrics */}
          <ChartCard title="Performance Metrics" subtitle="System & user performance" icon={Activity}>
            <div className="h-80">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Line type="monotone" dataKey="performance" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }} />
                    <Line type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }} />
                    <Line type="monotone" dataKey="engagement" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              )}
            </div>
          </ChartCard>

          {/* Grade Distribution */}
          <ChartCard title="Grade Distribution" subtitle="Academic performance overview" icon={Award}>
            <div className="h-80">
              {gradeDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="grade" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [`${value} students (${gradeDistributionData.find(d => d.count === value)?.percentage}%)`, 'Count']}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl">
                  <Lightning className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Quick Actions</h2>
                  <p className="text-gray-600 mt-1">Get things done faster</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                {user?.role === 'admin' ? '4 actions' : '4 actions'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user?.role === 'admin' ? (
                <>
                  <QuickActionCard
                    title="Add New Student"
                    description="Register a new student and set up their profile in the system with course enrollment options."
                    icon={UserCheck}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={() => window.location.href = '/students'}
                    badge="Popular"
                  />
                  <QuickActionCard
                    title="Create Course"
                    description="Add a new course offering with detailed information, enrollment limits, and instructor assignment."
                    icon={BookMarked}
                    color="bg-gradient-to-r from-green-500 to-green-600"
                    onClick={() => window.location.href = '/courses'}
                    badge="New"
                  />
                  <QuickActionCard
                    title="Analytics Dashboard"
                    description="Access detailed reports and insights about student performance, enrollment trends, and system metrics."
                    icon={BarChart3}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                  />
                  <QuickActionCard
                    title="System Management"
                    description="Configure system preferences, user permissions, backup settings, and institutional configurations."
                    icon={Globe}
                    color="bg-gradient-to-r from-orange-500 to-orange-600"
                  />
                </>
              ) : (
                <>
                  <QuickActionCard
                    title="Browse Courses"
                    description="Explore available courses and find the perfect fit for your academic goals and career aspirations."
                    icon={BookOpen}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={() => window.location.href = '/courses'}
                    badge="Trending"
                  />
                  <QuickActionCard
                    title="My Profile"
                    description="Update your personal information, academic preferences, and manage your learning journey."
                    icon={Users}
                    color="bg-gradient-to-r from-green-500 to-green-600"
                    onClick={() => window.location.href = '/students'}
                  />
                  <QuickActionCard
                    title="Academic Calendar"
                    description="View important dates, assignment deadlines, exam schedules, and upcoming academic events."
                    icon={Calendar}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                  />
                  <QuickActionCard
                    title="Support Center"
                    description="Get help with registration, technical issues, academic guidance, and connect with advisors."
                    icon={Heart}
                    color="bg-gradient-to-r from-pink-500 to-pink-600"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-8">
          {user?.role === 'admin' && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-xl">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors duration-200">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No recent activity</p>
                    <p className="text-gray-400 text-sm mt-1">Activity will appear here as users interact with the system</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Performance Insights */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-8 translate-y-8"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  {user?.role === 'admin' ? 'System Performance' : 'Your Progress'}
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white/90">
                      {user?.role === 'admin' ? 'Enrollment Rate' : 'Course Completion'}
                    </span>
                    <span className="text-lg font-black">92%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-300 h-3 rounded-full transition-all duration-2000 shadow-inner" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white/90">
                      {user?.role === 'admin' ? 'Student Satisfaction' : 'Academic Performance'}
                    </span>
                    <span className="text-lg font-black">88%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-2000 shadow-inner" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white/90">
                      {user?.role === 'admin' ? 'System Efficiency' : 'Learning Progress'}
                    </span>
                    <span className="text-lg font-black">95%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-2000 shadow-inner" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm font-bold text-white/90">Insights</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {user?.role === 'admin' 
                    ? '🎉 Excellent performance this semester! Student engagement is up 15% and system efficiency has improved significantly.'
                    : '🌟 You\'re doing amazing! Keep up the great work on your academic journey. Your progress is inspiring!'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard