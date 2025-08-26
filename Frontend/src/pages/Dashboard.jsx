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
  AreaChart,
  Pie
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
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real data with higher limits to get actual data
      const [studentsRes, coursesRes, registrationsRes] = await Promise.all([
        studentsAPI.getAll({ limit: 1000 }),
        coursesAPI.getAll({ limit: 1000 }),
        registrationsAPI.getAll({ limit: 1000 })
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

      // Generate analytics data based on real data
      generateRealAnalyticsData(students, courses, registrations)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const generateRealAnalyticsData = (students, courses, registrations) => {
    // Real enrollment trends based on registration dates
    const enrollmentTrends = generateEnrollmentTrends(registrations)
    
    // Real course distribution based on actual courses
    const courseDistribution = generateCourseDistribution(courses, registrations)
    
    // Real status distribution based on actual registration statuses
    const statusDistribution = generateStatusDistribution(registrations)
    
    // Real growth data based on creation dates
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
      const dept = course.department || 'Other'
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
    await fetchDashboardData()
    setTimeout(() => setRefreshing(false), 1000)
    toast.success('Dashboard refreshed!')
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, delay = 0 }) => (
    <div 
      className="relative group animate-fade-in transition-all duration-300 hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Header */}
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
        
        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </div>
        </div>
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
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            trend="up"
            trendValue={12}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title="Active Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            trend="up"
            trendValue={8}
            color="bg-gradient-to-r from-green-500 to-green-600"
            delay={100}
          />
          <StatCard
            title="Total Enrollments"
            value={stats.totalRegistrations}
            icon={GraduationCap}
            trend="up"
            trendValue={15}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            delay={200}
          />
          <StatCard
            title="Active Enrollments"
            value={stats.activeEnrollments}
            icon={TrendingUp}
            trend="up"
            trendValue={23}
            color="bg-gradient-to-r from-pink-500 to-pink-600"
            delay={300}
          />
        </div>

        {/* Analytics Section */}
        <div className="space-y-6">
          {/* Analytics Navigation */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { id: 'enrollment', label: 'Enrollment Analytics', icon: BarChart3, color: 'blue' },
              { id: 'distribution', label: 'Course Distribution', icon: PieChart, color: 'green' },
              { id: 'growth', label: 'Growth Trends', icon: TrendingUp, color: 'purple' },
              { id: 'status', label: 'Status Overview', icon: Activity, color: 'pink' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedAnalytic(item.id)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  selectedAnalytic === item.id
                    ? item.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' :
                      item.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' :
                      item.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' :
                      'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Analytics Content */}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              description: 'View detailed analytics and reports',
              icon: Trophy,
              color: 'from-purple-500 to-purple-600',
              href: '#'
            }
          ].map((action, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 mb-4">{action.description}</p>
              
              <button className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200">
                <span>Learn More</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard