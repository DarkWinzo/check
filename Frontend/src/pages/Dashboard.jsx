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
  Sparkles,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Calendar,
  Award,
  Target,
  Eye,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  UserCheck,
  BookMarked,
  TrendingDown
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    studentsPerCourse: 0,
    totalRegistrations: 0,
    activeStudents: 0,
    completedCourses: 0,
    pendingRegistrations: 0,
    averageGrade: 0
  })
  const [chartData, setChartData] = useState({
    enrollmentByMonth: [],
    coursePopularity: [],
    statusDistribution: [],
    enrollmentTrend: [],
    departmentStats: []
  })
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [selectedChart, setSelectedChart] = useState('enrollment')
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [analyticsType, setAnalyticsType] = useState('')

  useEffect(() => {
    fetchDashboardData()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStudents()
    }
  }, [searchTerm, currentPage, user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (user?.role === 'admin') {
        const [studentsRes, coursesRes, registrationsRes] = await Promise.all([
          studentsAPI.getAll({ limit: 1000 }).catch(err => {
            console.error('Students API Error:', err)
            toast.error('Failed to fetch students data')
            return { data: { students: [], pagination: { totalCount: 0 } } }
          }),
          coursesAPI.getAll({ limit: 1000 }).catch(err => {
            console.error('Courses API Error:', err)
            toast.error('Failed to fetch courses data')
            return { data: { courses: [], pagination: { totalCount: 0 } } }
          }),
          registrationsAPI.getAll({ limit: 1000 }).catch(err => {
            console.error('Registrations API Error:', err)
            toast.error('Failed to fetch registrations data')
            return { data: { registrations: [], pagination: { totalCount: 0 } } }
          })
        ])

        const totalStudents = studentsRes.data.pagination?.totalCount || 0
        const totalCourses = coursesRes.data.pagination?.totalCount || 0
        const totalRegistrations = registrationsRes.data.pagination?.totalCount || 0
        const activeStudents = studentsRes.data.students?.filter(s => s.status === 'active').length || 0
        
        // Calculate average students per course with error handling
        const studentsPerCourse = totalCourses > 0 ? Math.round((totalRegistrations / totalCourses) * 10) / 10 : 0

        // Calculate additional stats
        const completedCourses = registrationsRes.data.registrations?.filter(r => r.status === 'completed').length || 0
        const pendingRegistrations = registrationsRes.data.registrations?.filter(r => r.status === 'pending').length || 0

        setStats({
          totalStudents,
          totalCourses,
          studentsPerCourse,
          totalRegistrations,
          activeStudents,
          completedCourses,
          pendingRegistrations,
          averageGrade: 85.5 // Mock data for now
        })

        // Prepare chart data with error handling
        if (studentsRes.data.students && coursesRes.data.courses && registrationsRes.data.registrations) {
          prepareChartData(studentsRes.data.students, coursesRes.data.courses, registrationsRes.data.registrations)
        }
      } else {
        // For students, show limited stats
        try {
          const coursesRes = await coursesAPI.getAll({ limit: 20 })
          setStats({
            totalCourses: coursesRes.data.pagination?.totalCount || 0,
            availableCourses: coursesRes.data.courses?.filter(c => c.status === 'active').length || 0,
            myRegistrations: 0, // TODO: Fetch student's own registrations
            completedCourses: 0,
            totalStudents: 0,
            totalRegistrations: 0,
            studentsPerCourse: 0
          })
        } catch (error) {
          console.error('Error fetching student dashboard data:', error)
          toast.error('Failed to load dashboard data')
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try refreshing.')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    if (user?.role !== 'admin') return
    
    try {
      setStudentsLoading(true)
      const params = {
        page: currentPage,
        limit: 5,
        search: searchTerm
      }

      const response = await studentsAPI.getAll(params)
      setStudents(response.data.students || [])
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to fetch students')
      setStudents([])
      setPagination({})
    } finally {
      setStudentsLoading(false)
    }
  }

  const prepareChartData = (students, courses, registrations) => {
    try {
      // Enrollment by month (last 6 months)
      const monthlyData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthName = date.toLocaleDateString('en-US', { month: 'short' })
        const monthYear = date.toISOString().slice(0, 7)
        
        const enrollments = registrations.filter(reg => 
          reg.registration_date && reg.registration_date.startsWith(monthYear)
        ).length
        
        monthlyData.push({
          month: monthName,
          enrollments,
          students: Math.floor(enrollments * 0.8) // Mock active students
        })
      }

      // Course popularity (top 5 courses by enrollment)
      const courseEnrollments = {}
      registrations.forEach(reg => {
        const courseId = reg.course_id
        const course = courses.find(c => c.id === courseId)
        if (course) {
          const courseName = course.course_name.length > 20 
            ? course.course_name.substring(0, 20) + '...' 
            : course.course_name
          courseEnrollments[courseName] = (courseEnrollments[courseName] || 0) + 1
        }
      })

      const coursePopularity = Object.entries(courseEnrollments)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, students: count, percentage: Math.round((count / registrations.length) * 100) }))

      // Status distribution
      const statusCounts = students.reduce((acc, student) => {
        const status = student.status || 'unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        percentage: Math.round((count / students.length) * 100)
      }))

      // Department statistics
      const departmentStats = courses.reduce((acc, course) => {
        const dept = course.department || 'Other'
        if (!acc[dept]) {
          acc[dept] = { name: dept, courses: 0, enrollments: 0 }
        }
        acc[dept].courses += 1
        acc[dept].enrollments += registrations.filter(r => r.course_id === course.id).length
        return acc
      }, {})

      setChartData({
        enrollmentByMonth: monthlyData,
        coursePopularity,
        statusDistribution,
        enrollmentTrend: monthlyData,
        departmentStats: Object.values(departmentStats)
      })
    } catch (error) {
      console.error('Error preparing chart data:', error)
      toast.error('Failed to prepare analytics data')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    if (user?.role === 'admin') {
      await fetchStudents()
    }
    setRefreshing(false)
    toast.success('Dashboard refreshed successfully!')
  }

  const openAnalyticsModal = (type) => {
    setAnalyticsType(type)
    setShowAnalyticsModal(true)
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bgGradient, onClick, subtitle }) => (
    <div 
      className={`relative overflow-hidden rounded-2xl ${bgGradient} p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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
              trend === 'up' ? 'bg-green-100 text-green-800' : trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
        
        <div className="text-3xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
          {loading ? <LoadingSpinner size="sm" /> : value}
        </div>
        <div className="text-white/80 text-sm font-medium">{title}</div>
        {subtitle && (
          <div className="text-white/60 text-xs mt-1">{subtitle}</div>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div className="h-full bg-white/40 rounded-full transition-all duration-1000" style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}></div>
      </div>
      
      {onClick && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ChevronRight className="h-5 w-5 text-white/80" />
        </div>
      )}
    </div>
  )

  const AnalyticsModal = () => {
    if (!showAnalyticsModal) return null

    const getModalContent = () => {
      switch (analyticsType) {
        case 'enrollment':
          return {
            title: 'Enrollment Trend Analysis',
            icon: TrendingUp,
            content: (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Monthly Enrollment Trend</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.enrollmentByMonth}>
                      <defs>
                        <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="enrollments" stroke="#3B82F6" fillOpacity={1} fill="url(#colorEnrollments)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalRegistrations}</div>
                    <div className="text-sm text-gray-600">Total Enrollments</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">{stats.studentsPerCourse}</div>
                    <div className="text-sm text-gray-600">Avg per Course</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-purple-600">85%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            )
          }
        case 'status':
          return {
            title: 'Student Status Distribution',
            icon: PieChart,
            content: (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Status Breakdown</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={chartData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {chartData.statusDistribution.map((status, index) => (
                    <div key={status.name} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5] }}
                        ></div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{status.value}</div>
                          <div className="text-sm text-gray-600">{status.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        case 'courses':
          return {
            title: 'Most Popular Courses',
            icon: BarChart3,
            content: (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Course Popularity Ranking</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.coursePopularity} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {chartData.coursePopularity.map((course, index) => (
                    <div key={course.name} className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{course.name}</div>
                          <div className="text-sm text-gray-600">{course.students} students enrolled</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{course.percentage || 0}%</div>
                        <div className="text-xs text-gray-500">of total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        default:
          return { title: 'Analytics', icon: BarChart3, content: <div>No data available</div> }
      }
    }

    const modalContent = getModalContent()

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowAnalyticsModal(false)}
          />
          <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <modalContent.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{modalContent.title}</h3>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {modalContent.content}
            </div>
          </div>
        </div>
      </div>
    )
  }

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="btn btn-primary flex items-center space-x-2 mx-auto"
            disabled={refreshing}
          >
            {refreshing ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
            <span>Retry</span>
          </button>
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
                  ? 'Monitor your institution\'s performance with advanced analytics and insights.'
                  : 'Explore courses, track your progress, and manage your academic journey.'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/30 hover:bg-white/30 transition-all duration-200"
                title="Refresh Dashboard"
              >
                <RefreshCw className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              subtitle={`${stats.activeStudents} active`}
            />
            <StatCard
              title="Total Courses"
              value={stats.totalCourses}
              icon={BookOpen}
              trend="up"
              trendValue="8"
              color="bg-gradient-to-r from-green-500 to-green-600"
              bgGradient="bg-gradient-to-br from-green-500 to-green-600"
              subtitle="Available for enrollment"
            />
            <StatCard
              title="Students per Course"
              value={stats.studentsPerCourse}
              icon={TrendingUp}
              trend="up"
              trendValue="5"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
              subtitle="Average enrollment"
            />
            <StatCard
              title="Total Registrations"
              value={stats.totalRegistrations}
              icon={Activity}
              trend="up"
              trendValue="15"
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
              subtitle={`${stats.completedCourses} completed`}
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
              value={stats.myRegistrations || 0}
              icon={Users}
              color="bg-gradient-to-r from-green-500 to-green-600"
              bgGradient="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatCard
              title="Completed Courses"
              value={stats.completedCourses || 0}
              icon={Award}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatCard
              title="Current Semester"
              value="Fall 2025"
              icon={Calendar}
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </>
        )}
      </div>

      {/* Analytics Cards for Admin */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            onClick={() => openAnalyticsModal('enrollment')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-lg font-bold mb-2">Enrollment Trend</h3>
            <p className="text-white/80 text-sm">View detailed enrollment analytics and trends over time</p>
          </div>

          <div 
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            onClick={() => openAnalyticsModal('status')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <PieChart className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-lg font-bold mb-2">Student Status</h3>
            <p className="text-white/80 text-sm">Analyze student status distribution and engagement</p>
          </div>

          <div 
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            onClick={() => openAnalyticsModal('courses')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <BarChart3 className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-lg font-bold mb-2">Popular Courses</h3>
            <p className="text-white/80 text-sm">Discover which courses are most in demand</p>
          </div>
        </div>
      )}

      {/* Recent Students Section (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Students</h2>
            </div>
            <div className="text-sm text-gray-500">Latest registrations</div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Students List */}
          {studentsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.email} • ID: {student.student_id}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(student.enrollment_date || student.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * 5) + 1} to{' '}
                    {Math.min(pagination.currentPage * 5, pagination.totalCount)} of{' '}
                    {pagination.totalCount} students
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={!pagination.hasPrev}
                      className="btn btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!pagination.hasNext}
                      className="btn btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No students found' : 'No students yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'Students will appear here once they are added to the system.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Welcome Message for Students */}
      {user?.role === 'student' && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Academic Journey
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Navigate through the menu to explore available courses, manage your registrations, and track your academic progress. Your learning journey starts here!
          </p>
        </div>
      )}

      {/* Analytics Modal */}
      <AnalyticsModal />
    </div>
  )
}

export default Dashboard