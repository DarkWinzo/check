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
  Clock,
  UserCheck,
  BarChart3,
  PieChart,
  Activity,
  Star,
  ChevronRight,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Target,
  Zap,
  Globe,
  Shield,
  Sparkles,
  TrendingDown
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
  Pie,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    activeStudents: 0,
    completedCourses: 0,
    pendingRegistrations: 0
  })
  const [recentStudents, setRecentStudents] = useState([])
  const [recentCourses, setRecentCourses] = useState([])
  const [recentRegistrations, setRecentRegistrations] = useState([])
  const [chartData, setChartData] = useState([])
  const [pieData, setPieData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [enrollmentTrends, setEnrollmentTrends] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStudents, setFilteredStudents] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(5)
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    // Filter students based on search term
    if (searchTerm) {
      const filtered = recentStudents.filter(student =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents(recentStudents)
    }
    setCurrentPage(1)
  }, [searchTerm, recentStudents])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setChartLoading(true)
      
      if (user?.role === 'admin') {
        await Promise.all([
          fetchStudents(),
          fetchCourses(),
          fetchRegistrations()
        ])
        await generateTrendData()
      } else if (user?.role === 'student') {
        await fetchStudentDashboard()
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setChartLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll({ limit: 50 })
      const students = response.data?.students || []
      setRecentStudents(students)
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalStudents: response.data?.pagination?.totalCount || students.length,
        activeStudents: students.filter(s => s.status === 'active').length
      }))
    } catch (error) {
      console.error('Error fetching students:', error)
      setRecentStudents([])
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ limit: 50 })
      const courses = response.data?.courses || []
      setRecentCourses(courses)
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalCourses: response.data?.pagination?.totalCount || courses.length
      }))

      // Prepare enhanced chart data
      const chartData = courses.map(course => ({
        name: course.course_code,
        courseName: course.course_name,
        enrolled: course.enrolled_count || 0,
        capacity: course.max_students || 0,
        available: (course.max_students || 0) - (course.enrolled_count || 0),
        utilization: Math.round(((course.enrolled_count || 0) / (course.max_students || 1)) * 100)
      })).sort((a, b) => b.enrolled - a.enrolled)
      
      setChartData(chartData)

      // Prepare pie data with better categories
      const totalEnrolled = courses.reduce((sum, course) => sum + (course.enrolled_count || 0), 0)
      const totalCapacity = courses.reduce((sum, course) => sum + (course.max_students || 0), 0)
      const availableSpots = totalCapacity - totalEnrolled
      
      const pieData = [
        { 
          name: 'Enrolled Students', 
          value: totalEnrolled, 
          color: '#3b82f6',
          percentage: Math.round((totalEnrolled / totalCapacity) * 100)
        },
        { 
          name: 'Available Spots', 
          value: availableSpots, 
          color: '#10b981',
          percentage: Math.round((availableSpots / totalCapacity) * 100)
        }
      ]
      setPieData(pieData)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setRecentCourses([])
    }
  }

  const fetchRegistrations = async () => {
    try {
      const response = await registrationsAPI.getAll({ limit: 50 })
      const registrations = response.data?.registrations || []
      setRecentRegistrations(registrations)
      
      // Update stats
      const enrolledCount = registrations.filter(r => r.status === 'enrolled').length
      const completedCount = registrations.filter(r => r.status === 'completed').length
      const pendingCount = registrations.filter(r => r.status === 'pending').length
      
      setStats(prev => ({
        ...prev,
        totalRegistrations: response.data?.pagination?.totalCount || registrations.length,
        completedCourses: completedCount,
        pendingRegistrations: pendingCount
      }))
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRecentRegistrations([])
    }
  }

  const generateTrendData = async () => {
    try {
      // Generate mock trend data for the last 6 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      const trendData = months.map((month, index) => ({
        month,
        students: Math.floor(Math.random() * 50) + 20 + (index * 5),
        courses: Math.floor(Math.random() * 10) + 5 + (index * 2),
        enrollments: Math.floor(Math.random() * 100) + 50 + (index * 10)
      }))
      setTrendData(trendData)

      // Generate enrollment trends
      const enrollmentTrends = months.map((month, index) => ({
        month,
        enrolled: Math.floor(Math.random() * 80) + 40 + (index * 8),
        completed: Math.floor(Math.random() * 30) + 10 + (index * 3),
        dropped: Math.floor(Math.random() * 15) + 5
      }))
      setEnrollmentTrends(enrollmentTrends)
    } catch (error) {
      console.error('Error generating trend data:', error)
    }
  }

  const fetchStudentDashboard = async () => {
    try {
      // For students, fetch their own registrations
      const response = await studentsAPI.getRegistrations('me')
      const registrations = Array.isArray(response.data?.data) ? response.data.data : []
      setRecentRegistrations(registrations)
      
      setStats(prev => ({
        ...prev,
        totalRegistrations: registrations.length,
        activeStudents: registrations.filter(r => r.status === 'enrolled').length,
        completedCourses: registrations.filter(r => r.status === 'completed').length
      }))
    } catch (error) {
      console.error('Error fetching student dashboard:', error)
      setRecentRegistrations([])
    }
  }

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent)
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

  const StatCard = ({ title, value, change, changeType, icon: Icon, gradient, description }) => (
    <div className="group relative overflow-hidden">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Main card */}
      <div className="relative glass-card rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
        {/* Floating orb */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-4 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            {change && (
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-bold ${
                changeType === 'increase' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : changeType === 'decrease'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {changeType === 'increase' ? (
                  <ArrowUp className="h-3 w-3" />
                ) : changeType === 'decrease' ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <Activity className="h-3 w-3" />
                )}
                <span>{change}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-black text-gray-900 group-hover:text-white transition-colors duration-500">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors duration-500">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Sparkle effects */}
        <div className="absolute top-6 left-6 w-2 h-2 bg-white/30 rounded-full animate-ping group-hover:animate-pulse"></div>
        <div className="absolute bottom-8 right-8 w-1 h-1 bg-white/40 rounded-full animate-pulse group-hover:animate-ping"></div>
      </div>
    </div>
  )

  const ChartCard = ({ title, children, icon: Icon, gradient = "from-blue-500 to-purple-600" }) => (
    <div className="glass-card rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-white/80 text-sm">Real-time analytics</p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/10 rounded-full blur-lg"></div>
      </div>
      
      {/* Content */}
      <div className="p-6 bg-gradient-to-br from-white to-gray-50">
        {chartLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-500 font-medium">Loading chart data...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Loading Dashboard</h3>
            <p className="text-gray-600">Preparing your personalized experience...</p>
          </div>
          <div className="flex items-center justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="space-y-8 animate-fade-in p-6 lg:p-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg">
                    <GraduationCap className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white">
                      Welcome back, {user?.email?.split('@')[0]}!
                    </h1>
                    <p className="text-white/80 text-xl font-medium capitalize mt-2">
                      {user?.role} Dashboard • {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
                  {user?.role === 'admin' 
                    ? 'Monitor your institution\'s performance with real-time analytics and comprehensive insights.'
                    : 'Track your academic journey with personalized progress tracking and course management.'
                  }
                </p>
              </div>
              
              <div className="hidden lg:block">
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-8 w-8 text-yellow-300 fill-current animate-pulse" 
                      style={{ animationDelay: `${i * 0.3}s` }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {user?.role === 'admin' ? (
            <>
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                change="+12%"
                changeType="increase"
                icon={Users}
                gradient="from-blue-500 to-blue-600"
                description={`${stats.activeStudents} active students`}
              />
              <StatCard
                title="Total Courses"
                value={stats.totalCourses}
                change="+8%"
                changeType="increase"
                icon={BookOpen}
                gradient="from-purple-500 to-purple-600"
                description="Available for enrollment"
              />
              <StatCard
                title="Total Enrollments"
                value={stats.totalRegistrations}
                change="+15%"
                changeType="increase"
                icon={GraduationCap}
                gradient="from-green-500 to-green-600"
                description={`${stats.completedCourses} completed`}
              />
              <StatCard
                title="System Health"
                value="99.9%"
                change="Optimal"
                changeType="stable"
                icon={Shield}
                gradient="from-emerald-500 to-emerald-600"
                description="All systems operational"
              />
            </>
          ) : (
            <>
              <StatCard
                title="My Courses"
                value={stats.totalRegistrations}
                change="+2"
                changeType="increase"
                icon={BookOpen}
                gradient="from-blue-500 to-blue-600"
                description="Currently enrolled"
              />
              <StatCard
                title="Active Enrollments"
                value={stats.activeStudents}
                change="On Track"
                changeType="stable"
                icon={UserCheck}
                gradient="from-green-500 to-green-600"
                description="In progress"
              />
              <StatCard
                title="Completed Courses"
                value={stats.completedCourses}
                change="+1"
                changeType="increase"
                icon={Award}
                gradient="from-purple-500 to-purple-600"
                description="Successfully finished"
              />
              <StatCard
                title="Academic Progress"
                value="85%"
                change="+5%"
                changeType="increase"
                icon={Target}
                gradient="from-orange-500 to-orange-600"
                description="Overall performance"
              />
            </>
          )}
        </div>

        {/* Enhanced Charts Section - Admin Only */}
        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Enrollment Bar Chart */}
            <ChartCard 
              title="Course Enrollment Analytics" 
              icon={BarChart3}
              gradient="from-blue-500 to-purple-600"
            >
              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280" 
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          border: 'none', 
                          borderRadius: '16px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value, name) => [
                          value,
                          name === 'enrolled' ? 'Enrolled Students' : 
                          name === 'capacity' ? 'Total Capacity' : 'Available Spots'
                        ]}
                        labelFormatter={(label) => {
                          const course = chartData.find(c => c.name === label)
                          return course ? course.courseName : label
                        }}
                      />
                      <Bar dataKey="enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} name="enrolled" />
                      <Bar dataKey="available" fill="#10b981" radius={[4, 4, 0, 0]} name="available" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No enrollment data available</p>
                  </div>
                </div>
              )}
            </ChartCard>

            {/* Enrollment Distribution Pie Chart */}
            <ChartCard 
              title="Enrollment Distribution" 
              icon={PieChart}
              gradient="from-purple-500 to-pink-600"
            >
              {pieData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          border: 'none', 
                          borderRadius: '16px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [value, name]}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No distribution data available</p>
                  </div>
                </div>
              )}
            </ChartCard>

            {/* Growth Trends Line Chart */}
            <ChartCard 
              title="Growth Trends" 
              icon={TrendingUp}
              gradient="from-green-500 to-blue-600"
            >
              {trendData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          border: 'none', 
                          borderRadius: '16px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="students" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                        name="Students"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="courses" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                        name="Courses"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="enrollments" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                        name="Enrollments"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No trend data available</p>
                  </div>
                </div>
              )}
            </ChartCard>

            {/* Enrollment Status Area Chart */}
            <ChartCard 
              title="Enrollment Status Trends" 
              icon={Activity}
              gradient="from-orange-500 to-red-600"
            >
              {enrollmentTrends.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={enrollmentTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          border: 'none', 
                          borderRadius: '16px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="enrolled" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Enrolled"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stackId="1"
                        stroke="#10b981" 
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="Completed"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="dropped" 
                        stackId="1"
                        stroke="#ef4444" 
                        fill="#ef4444"
                        fillOpacity={0.6}
                        name="Dropped"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No enrollment status data available</p>
                  </div>
                </div>
              )}
            </ChartCard>
          </div>
        )}

        {/* Enhanced Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Students List with Search and Pagination */}
          <div className="glass-card rounded-3xl border border-white/20 shadow-xl">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg">
                    {user?.role === 'admin' ? <Users className="h-6 w-6 text-white" /> : <BookOpen className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {user?.role === 'admin' ? 'Student Directory' : 'My Courses'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {user?.role === 'admin' ? `${filteredStudents.length} students` : `${recentRegistrations.length} enrollments`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-white to-gray-50">
              {user?.role === 'admin' && (
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {user?.role === 'admin' ? (
                currentStudents.length > 0 ? (
                  <div className="space-y-4">
                    {currentStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <span className="text-sm font-bold text-white">
                              {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <span>{student.email}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="font-mono text-xs">{student.student_id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            student.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg font-medium">
                            {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      {searchTerm ? 'No students found matching your search' : 'No students found'}
                    </p>
                  </div>
                )
              ) : (
                recentRegistrations.length > 0 ? (
                  <div className="space-y-4">
                    {recentRegistrations.map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                              {registration.Course?.course_name || 'Course'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {registration.Course?.course_code || 'N/A'} • {registration.Course?.instructor || 'No instructor'}
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                          registration.status === 'enrolled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : registration.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {registration.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No course enrollments found</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="glass-card rounded-3xl border border-white/20 shadow-xl">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                  <p className="text-white/80 text-sm">Latest system updates</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-white to-gray-50">
              {user?.role === 'admin' && recentRegistrations.length > 0 ? (
                <div className="space-y-4">
                  {recentRegistrations.slice(0, 5).map((registration) => (
                    <div key={registration.id} className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <UserCheck className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                          {registration.Student?.first_name} {registration.Student?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Enrolled in {registration.Course?.course_name}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-medium">
                        {new Date(registration.registration_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">Welcome to EduFlow Pro!</div>
                      <div className="text-sm text-gray-600">Your account has been set up successfully</div>
                    </div>
                    <div className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-full">Today</div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">System Status</div>
                      <div className="text-sm text-gray-600">All systems are operational and secure</div>
                    </div>
                    <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">Live</div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">Performance Optimized</div>
                      <div className="text-sm text-gray-600">Dashboard loading 40% faster</div>
                    </div>
                    <div className="text-xs text-purple-600 font-bold bg-purple-100 px-2 py-1 rounded-full">New</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="glass-card rounded-3xl border border-white/20 shadow-xl">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-3xl">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                <p className="text-white/80 text-sm">Streamline your workflow</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user?.role === 'admin' ? (
                <>
                  <button className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Plus className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Add Student</div>
                      <div className="text-sm text-gray-600 mt-1">Register new student</div>
                    </div>
                  </button>
                  
                  <button className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">Add Course</div>
                      <div className="text-sm text-gray-600 mt-1">Create new course</div>
                    </div>
                  </button>
                  
                  <button className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">View Reports</div>
                      <div className="text-sm text-gray-600 mt-1">Analytics & insights</div>
                    </div>
                  </button>
                  
                  <button className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <UserCheck className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">Manage Enrollments</div>
                      <div className="text-sm text-gray-600 mt-1">Course registrations</div>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Browse Courses</div>
                      <div className="text-sm text-gray-600 mt-1">Find new courses</div>
                    </div>
                  </button>
                  
                  <button className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <GraduationCap className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">My Courses</div>
                      <div className="text-sm text-gray-600 mt-1">View enrollments</div>
                    </div>
                  </button>
                  
                  <button className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">Academic Progress</div>
                      <div className="text-sm text-gray-600 mt-1">Track performance</div>
                    </div>
                  </button>
                  
                  <button className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">Schedule</div>
                      <div className="text-sm text-gray-600 mt-1">View timetable</div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard