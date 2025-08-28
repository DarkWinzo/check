import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { studentsAPI, coursesAPI, registrationsAPI } from '../services/api'
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  Eye,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Globe,
  Clock,
  UserCheck,
  BookMarked,
  Trophy,
  Flame,
  Heart,
  Lightbulb
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
  Pie
} from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    activeEnrollments: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({
    enrollmentTrends: [],
    courseDistribution: [],
    statusDistribution: [],
    growthData: []
  })
  const [selectedAnalytic, setSelectedAnalytic] = useState('enrollment')
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    let interval
    if (autoRefreshEnabled) {
      interval = setInterval(() => {
        fetchDashboardData(true)
      }, 30000)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoRefreshEnabled])

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      }
      
      const [studentsRes, coursesRes, registrationsRes] = await Promise.all([
        studentsAPI.getAll({ limit: 1000 }).catch(() => ({ data: { students: [] } })),
        coursesAPI.getAll({ limit: 1000 }).catch(() => ({ data: { courses: [] } })),
        registrationsAPI.getAll({ limit: 1000 }).catch(() => ({ data: { registrations: [] } }))
      ])

      const students = studentsRes.data.students || []
      const courses = coursesRes.data.courses || []
      const registrations = registrationsRes.data.registrations || []

      const activeEnrollments = registrations.filter(r => r.status === 'enrolled').length

      setStats({
        totalStudents: students.length,
        totalCourses: courses.length,
        totalRegistrations: registrations.length,
        activeEnrollments: activeEnrollments
      })

      generateRealAnalyticsData(students, courses, registrations)
      
      if (silent) {
        const event = new CustomEvent('systemNotification', {
          detail: { 
            title: 'Dashboard Updated', 
            message: 'Latest data has been loaded automatically', 
            type: 'info' 
          }
        })
        window.dispatchEvent(event)
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      if (!silent) {
        toast.error('Failed to load dashboard data')
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const generateRealAnalyticsData = (students, courses, registrations) => {
    const enrollmentTrends = generateEnrollmentTrends(registrations)
    const courseDistribution = generateCourseDistribution(courses, registrations)
    const statusDistribution = generateStatusDistribution(registrations)
    const growthData = generateGrowthData(students, courses, registrations)

    setAnalyticsData({
      enrollmentTrends,
      courseDistribution,
      statusDistribution,
      growthData
    })
  }

  const generateEnrollmentTrends = (registrations) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentDate = new Date()
    const trends = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = monthNames[date.getMonth()]
      
      const monthRegistrations = registrations.filter(reg => {
        const regDate = new Date(reg.registration_date)
        return regDate.getMonth() === date.getMonth() && regDate.getFullYear() === date.getFullYear()
      })

      const enrollments = monthRegistrations.filter(reg => reg.status === 'enrolled').length
      const completions = monthRegistrations.filter(reg => reg.status === 'completed').length

      trends.push({
        month: monthName,
        enrollments,
        completions
      })
    }

    return trends
  }

  const generateCourseDistribution = (courses, registrations) => {
    const departments = {}
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
    
    courses.forEach(course => {
      const dept = course.department || 'General'
      if (!departments[dept]) {
        departments[dept] = 0
      }
      departments[dept]++
    })

    return Object.entries(departments).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))
  }

  const generateStatusDistribution = (registrations) => {
    const statusCounts = {
      enrolled: 0,
      completed: 0,
      dropped: 0
    }

    registrations.forEach(reg => {
      if (statusCounts.hasOwnProperty(reg.status)) {
        statusCounts[reg.status]++
      }
    })

    const total = registrations.length || 1

    return [
      { name: 'Enrolled', value: Math.round((statusCounts.enrolled / total) * 100), color: '#10b981' },
      { name: 'Completed', value: Math.round((statusCounts.completed / total) * 100), color: '#3b82f6' },
      { name: 'Dropped', value: Math.round((statusCounts.dropped / total) * 100), color: '#ef4444' }
    ]
  }

  const generateGrowthData = (students, courses, registrations) => {
    const weeks = []
    const currentDate = new Date()

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(currentDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000))
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000))

      const studentsCount = students.filter(s => new Date(s.created_at) <= weekEnd).length
      const coursesCount = courses.filter(c => new Date(c.created_at) <= weekEnd).length
      const registrationsCount = registrations.filter(r => new Date(r.registration_date) <= weekEnd).length

      weeks.push({
        period: `Week ${4 - i}`,
        students: studentsCount,
        courses: coursesCount,
        registrations: registrationsCount
      })
    }

    return weeks
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchDashboardData()
      toast.success('Dashboard refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'students':
        navigate('/students')
        break
      case 'courses':
        navigate('/courses')
        break
      case 'analytics':
        // Show analytics modal or navigate to analytics page
        toast.success('Analytics feature coming soon!')
        break
      default:
        break
    }
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, delay = 0, onClick }) => (
    <div 
      className="relative group animate-fade-in transition-all duration-300 hover:scale-105 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="relative bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute top-2 right-2">
          <div className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} 
               title={autoRefreshEnabled ? 'Auto-refresh enabled' : 'Auto-refresh disabled'} />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-md`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  )

  const AnalyticsCard = ({ title, children, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl shadow-md ${
            color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
            color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
            color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
            'bg-gradient-to-r from-pink-500 to-pink-600'
          }`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
            title="Refresh now"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>
      
      {children}
    </div>
  )

  const renderAnalyticsContent = () => {
    switch (selectedAnalytic) {
      case 'enrollment':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.enrollmentTrends}>
              <defs>
                <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="enrollments" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#enrollmentGradient)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="completions" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#completionGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={analyticsData.courseDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.courseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        )
      
      case 'growth':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="students" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="registrations" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'status':
        return (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={analyticsData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-3 gap-4">
              {analyticsData.statusDistribution.map((item, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </div>
                  <div className="text-sm text-gray-600">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <p className="text-xl text-gray-600">
            Welcome back, {user?.email?.split('@')[0]}! Here's your overview
          </p>
          
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-500">
              Auto-refresh {autoRefreshEnabled ? 'enabled' : 'disabled'}
            </span>
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-2"
            >
              {autoRefreshEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            trend="up"
            trendValue={12}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            delay={0}
            onClick={() => handleQuickAction('students')}
          />
          <StatCard
            title="Active Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            trend="up"
            trendValue={8}
            color="bg-gradient-to-r from-green-500 to-green-600"
            delay={100}
            onClick={() => handleQuickAction('courses')}
          />
          <StatCard
            title="Total Enrollments"
            value={stats.totalRegistrations}
            icon={GraduationCap}
            trend="up"
            trendValue={15}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            delay={200}
            onClick={() => handleRefresh()}
          />
          <StatCard
            title="Active Enrollments"
            value={stats.activeEnrollments}
            icon={TrendingUp}
            trend="up"
            trendValue={23}
            color="bg-gradient-to-r from-pink-500 to-pink-600"
            delay={300}
            onClick={() => handleRefresh()}
          />
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { id: 'enrollment', label: 'Enrollment Analytics', icon: BarChart3, color: 'blue' },
              { id: 'distribution', label: 'Course Distribution', icon: PieChart, color: 'green' },
              { id: 'growth', label: 'Growth Trends', icon: TrendingUp, color: 'purple' },
              { id: 'status', label: 'Status Overview', icon: Activity, color: 'pink' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedAnalytic(item.id)
                  fetchDashboardData(true)
                }}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 hover:scale-105 transform ${
                  selectedAnalytic === item.id
                    ? item.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' :
                      item.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' :
                      item.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' :
                      'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <AnalyticsCard
            title={
              selectedAnalytic === 'enrollment' ? 'Course Enrollment Analytics' :
              selectedAnalytic === 'distribution' ? 'Course Distribution by Department' :
              selectedAnalytic === 'growth' ? 'Growth Trends Over Time' :
              'Enrollment Status Overview'
            }
            icon={
              selectedAnalytic === 'enrollment' ? BarChart3 :
              selectedAnalytic === 'distribution' ? PieChart :
              selectedAnalytic === 'growth' ? TrendingUp :
              Activity
            }
            color={
              selectedAnalytic === 'enrollment' ? 'blue' :
              selectedAnalytic === 'distribution' ? 'green' :
              selectedAnalytic === 'growth' ? 'purple' :
              'pink'
            }
          >
            {renderAnalyticsContent()}
          </AnalyticsCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: 'Student Management', 
              description: 'Manage student profiles and enrollments',
              icon: UserCheck,
              color: 'from-blue-500 to-blue-600',
              action: 'students'
            },
            { 
              title: 'Course Management', 
              description: 'Create and manage course offerings',
              icon: BookMarked,
              color: 'from-green-500 to-green-600',
              action: 'courses'
            },
            { 
              title: 'Analytics Reports', 
              description: 'View detailed analytics and reports',
              icon: Trophy,
              color: 'from-purple-500 to-purple-600',
              action: 'analytics'
            }
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group text-left w-full hover:scale-105 transform"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200">
                {action.title}
              </h3>
              <p className="text-gray-600 mb-4">{action.description}</p>
              
              <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-200">
                <span>Access Now</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>
          
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="relative p-3 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                    <Zap className="h-7 w-7 text-yellow-400 drop-shadow-lg animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                      System Status
                    </span>
                  </h3>
                  <p className="text-white/60 text-sm font-medium">Real-time system monitoring</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div className="text-right">
                  <div className="text-green-300 font-bold text-sm">All Systems Operational</div>
                  <div className="text-white/50 text-xs">Last checked: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-500/20 rounded-xl">
                      <Activity className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="text-xs text-green-300 font-semibold bg-green-500/20 px-2 py-1 rounded-full">
                      EXCELLENT
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                      99.9%
                    </div>
                    <div className="text-white/70 text-sm font-medium">System Uptime</div>
                    <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full animate-pulse" style={{ width: '99.9%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-xs text-blue-300 font-semibold bg-blue-500/20 px-2 py-1 rounded-full">
                      ACTIVE
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                      {(stats.totalStudents + stats.totalCourses).toLocaleString()}
                    </div>
                    <div className="text-white/70 text-sm font-medium">Total Records</div>
                    <div className="mt-3 flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                      <RefreshCw className={`h-5 w-5 text-purple-400 ${autoRefreshEnabled ? 'animate-spin' : ''}`} />
                    </div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      autoRefreshEnabled 
                        ? 'text-purple-300 bg-purple-500/20' 
                        : 'text-gray-400 bg-gray-500/20'
                    }`}>
                      {autoRefreshEnabled ? 'AUTO' : 'MANUAL'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                      {autoRefreshEnabled ? '30s' : 'Manual'}
                    </div>
                    <div className="text-white/70 text-sm font-medium">Refresh Rate</div>
                    <div className="mt-3">
                      {autoRefreshEnabled ? (
                        <div className="flex items-center justify-center space-x-1">
                          <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-6 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          <div className="w-1 h-7 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                          <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 mx-auto border-2 border-gray-400 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="text-xs text-yellow-300 font-semibold bg-yellow-500/20 px-2 py-1 rounded-full">
                      LIVE
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-white mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent font-mono">
                      {new Date().toLocaleTimeString()}
                    </div>
                    <div className="text-white/70 text-sm font-medium">Last Updated</div>
                    <div className="mt-3 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-6 h-6 border-2 border-yellow-400 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-6 h-6 border-t-2 border-orange-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Activity className="h-4 w-4 text-red-400" />
                    </div>
                    <span className="text-white/80 font-medium">CPU Usage</span>
                  </div>
                  <span className="text-red-300 font-bold">23%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full animate-pulse" style={{ width: '23%' }}></div>
                </div>
                <div className="text-xs text-white/50">Optimal performance</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Zap className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-white/80 font-medium">Memory</span>
                  </div>
                  <span className="text-blue-300 font-bold">67%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full animate-pulse" style={{ width: '67%' }}></div>
                </div>
                <div className="text-xs text-white/50">Within normal range</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Globe className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-white/80 font-medium">Network</span>
                  </div>
                  <span className="text-green-300 font-bold">Fast</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-1 bg-white/10 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full animate-pulse" style={{ width: '89%' }}></div>
                  </div>
                </div>
                <div className="text-xs text-white/50">Connection stable</div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white/60 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>System healthy</span>
                </div>
                <div className="flex items-center space-x-2 text-white/60 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Database connected</span>
                </div>
                <div className="flex items-center space-x-2 text-white/60 text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>API responsive</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                    autoRefreshEnabled
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {autoRefreshEnabled ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
                </button>
                
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard