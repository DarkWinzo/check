import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
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
  AreaChart
} from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    activeEnrollments: 0
  })
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    enrollmentTrends: [],
    courseDistribution: [],
    statusDistribution: [],
    growthData: []
  })
  const [selectedAnalytic, setSelectedAnalytic] = useState('enrollment')
  const [timeRange, setTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch basic stats
      const [studentsRes, coursesRes, registrationsRes] = await Promise.all([
        studentsAPI.getAll({ limit: 1 }),
        coursesAPI.getAll({ limit: 1 }),
        registrationsAPI.getAll({ limit: 1 })
      ])

      setStats({
        totalStudents: studentsRes.data.pagination?.totalCount || 0,
        totalCourses: coursesRes.data.pagination?.totalCount || 0,
        totalRegistrations: registrationsRes.data.pagination?.totalCount || 0,
        activeEnrollments: registrationsRes.data.registrations?.filter(r => r.status === 'enrolled').length || 0
      })

      // Generate mock analytics data (in real app, this would come from API)
      generateAnalyticsData()
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const generateAnalyticsData = () => {
    // Mock data generation for analytics
    const enrollmentTrends = [
      { month: 'Jan', enrollments: 45, completions: 38 },
      { month: 'Feb', enrollments: 52, completions: 41 },
      { month: 'Mar', enrollments: 48, completions: 45 },
      { month: 'Apr', enrollments: 61, completions: 52 },
      { month: 'May', enrollments: 55, completions: 48 },
      { month: 'Jun', enrollments: 67, completions: 58 }
    ]

    const courseDistribution = [
      { name: 'Computer Science', value: 35, color: '#3b82f6' },
      { name: 'Mathematics', value: 25, color: '#10b981' },
      { name: 'Physics', value: 20, color: '#f59e0b' },
      { name: 'Chemistry', value: 15, color: '#ef4444' },
      { name: 'Biology', value: 5, color: '#8b5cf6' }
    ]

    const statusDistribution = [
      { name: 'Enrolled', value: 68, color: '#10b981' },
      { name: 'Completed', value: 25, color: '#3b82f6' },
      { name: 'Dropped', value: 7, color: '#ef4444' }
    ]

    const growthData = [
      { period: 'Week 1', students: 120, courses: 15, registrations: 89 },
      { period: 'Week 2', students: 135, courses: 16, registrations: 102 },
      { period: 'Week 3', students: 142, courses: 18, registrations: 118 },
      { period: 'Week 4', students: 158, courses: 19, registrations: 134 }
    ]

    setAnalyticsData({
      enrollmentTrends,
      courseDistribution,
      statusDistribution,
      growthData
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setTimeout(() => setRefreshing(false), 1000)
    toast.success('Dashboard refreshed!')
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, gradient, delay = 0 }) => (
    <div 
      className={`relative group animate-fade-in hover:scale-105 transition-all duration-500 transform hover:-translate-y-2`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 3D Card Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      
      <div className={`relative glass-card rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-4xl transition-all duration-500 ${gradient} backdrop-blur-2xl`}>
        {/* Floating Icon */}
        <div className="absolute -top-4 -right-4">
          <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Sparkle Effects */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute bottom-6 right-8 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-80"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white/90 group-hover:text-white transition-colors duration-300">
              {title}
            </h3>
            {trend && (
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                trend === 'up' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>{trendValue}%</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-4xl font-black text-white group-hover:scale-110 transition-transform duration-300">
              {value.toLocaleString()}
            </div>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-white/40 to-white/80 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  )

  const AnalyticsCard = ({ title, children, icon: Icon, color = "blue" }) => (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition duration-1000"></div>
      
      <div className="relative glass-card rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-4xl transition-all duration-500 backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-2xl shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {children}
      </div>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="enrollments" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#enrollmentGradient)"
                strokeWidth={3}
              />
              <Area 
                type="monotone" 
                dataKey="completions" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#completionGradient)"
                strokeWidth={3}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="students" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="registrations" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
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
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-3 gap-4">
              {analyticsData.statusDistribution.map((item, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-2xl">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-white/20 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-32 h-32 border-4 border-t-cyan-400 border-r-purple-400 border-b-pink-400 border-l-yellow-400 rounded-full animate-spin"></div>
            <div className="absolute inset-4 w-24 h-24 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-8 text-2xl font-bold text-white">Loading Dashboard...</p>
          <p className="mt-2 text-white/70">Preparing your analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 rounded-3xl flex items-center justify-center shadow-2xl">
              <Activity className="h-12 w-12 text-white drop-shadow-lg" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce shadow-lg flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Analytics Dashboard
            </span>
          </h1>
          <p className="text-xl text-white/70 font-medium">
            Welcome back, {user?.email?.split('@')[0]}! Here's your learning overview
          </p>
          
          <div className="flex items-center justify-center space-x-1 mt-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            trend="up"
            trendValue={12}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            gradient="bg-gradient-to-br from-blue-500/10 to-blue-600/5"
            delay={0}
          />
          <StatCard
            title="Active Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            trend="up"
            trendValue={8}
            color="bg-gradient-to-r from-green-500 to-green-600"
            gradient="bg-gradient-to-br from-green-500/10 to-green-600/5"
            delay={100}
          />
          <StatCard
            title="Total Enrollments"
            value={stats.totalRegistrations}
            icon={GraduationCap}
            trend="up"
            trendValue={15}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            gradient="bg-gradient-to-br from-purple-500/10 to-purple-600/5"
            delay={200}
          />
          <StatCard
            title="Active Enrollments"
            value={stats.activeEnrollments}
            icon={TrendingUp}
            trend="up"
            trendValue={23}
            color="bg-gradient-to-r from-pink-500 to-pink-600"
            gradient="bg-gradient-to-br from-pink-500/10 to-pink-600/5"
            delay={300}
          />
        </div>

        {/* Analytics Section */}
        <div className="space-y-8">
          {/* Analytics Navigation */}
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { id: 'enrollment', label: 'Course Enrollment Analytics', icon: BarChart3, color: 'blue' },
              { id: 'distribution', label: 'Enrollment Distribution', icon: PieChart, color: 'green' },
              { id: 'growth', label: 'Growth Trends', icon: TrendingUp, color: 'purple' },
              { id: 'status', label: 'Enrollment Status Trends', icon: Activity, color: 'pink' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedAnalytic(item.id)}
                className={`relative group px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                  selectedAnalytic === item.id
                    ? `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white shadow-2xl`
                    : 'bg-white/10 backdrop-blur-xl text-white/80 hover:bg-white/20 border border-white/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                
                {selectedAnalytic === item.id && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 -z-10"></div>
                )}
              </button>
            ))}
          </div>

          {/* Analytics Content */}
          <AnalyticsCard
            title={
              selectedAnalytic === 'enrollment' ? 'Course Enrollment Analytics' :
              selectedAnalytic === 'distribution' ? 'Enrollment Distribution' :
              selectedAnalytic === 'growth' ? 'Growth Trends' :
              'Enrollment Status Trends'
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { 
              title: 'Student Management', 
              description: 'Manage student profiles and enrollments',
              icon: UserCheck,
              color: 'from-blue-500 to-blue-600',
              href: '/students'
            },
            { 
              title: 'Course Management', 
              description: 'Create and manage course offerings',
              icon: BookMarked,
              color: 'from-green-500 to-green-600',
              href: '/courses'
            },
            { 
              title: 'Analytics Reports', 
              description: 'Generate detailed analytics reports',
              icon: Trophy,
              color: 'from-purple-500 to-purple-600',
              href: '#'
            }
          ].map((action, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative glass-card rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-2xl group-hover:scale-105">
                <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 mb-4">{action.description}</p>
                
                <button className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200">
                  <span>Learn More</span>
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard