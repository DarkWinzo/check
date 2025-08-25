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
  Filter
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    studentsPerCourse: 0,
    totalRegistrations: 0
  })
  const [chartData, setChartData] = useState({
    enrollmentByMonth: [],
    coursePopularity: [],
    statusDistribution: []
  })
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

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
      
      if (user?.role === 'admin') {
        const [studentsRes, coursesRes, registrationsRes] = await Promise.all([
          studentsAPI.getAll({ limit: 1000 }),
          coursesAPI.getAll({ limit: 1000 }),
          registrationsAPI.getAll({ limit: 1000 })
        ])

        const totalStudents = studentsRes.data.pagination.totalCount
        const totalCourses = coursesRes.data.pagination.totalCount
        const totalRegistrations = registrationsRes.data.pagination.totalCount
        
        // Calculate average students per course
        const studentsPerCourse = totalCourses > 0 ? Math.round((totalRegistrations / totalCourses) * 10) / 10 : 0

        setStats({
          totalStudents,
          totalCourses,
          studentsPerCourse,
          totalRegistrations
        })

        // Prepare chart data
        prepareChartData(studentsRes.data.students, coursesRes.data.courses, registrationsRes.data.registrations)
      } else {
        // For students, show limited stats
        const coursesRes = await coursesAPI.getAll({ limit: 20 })
        setStats({
          totalCourses: coursesRes.data.pagination.totalCount,
          studentsPerCourse: 0,
          totalStudents: 0,
          totalRegistrations: 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
      setStudents(response.data.students)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setStudentsLoading(false)
    }
  }

  const prepareChartData = (students, courses, registrations) => {
    // Enrollment by month (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      const monthYear = date.toISOString().slice(0, 7)
      
      const enrollments = registrations.filter(reg => 
        reg.registration_date.startsWith(monthYear)
      ).length
      
      monthlyData.push({
        month: monthName,
        enrollments
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
      .map(([name, count]) => ({ name, students: count }))

    // Status distribution
    const statusCounts = students.reduce((acc, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1
      return acc
    }, {})

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }))

    setChartData({
      enrollmentByMonth: monthlyData,
      coursePopularity,
      statusDistribution
    })
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

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
            <StatCard
              title="Total Registrations"
              value={stats.totalRegistrations}
              icon={Activity}
              trend="up"
              trendValue="15"
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
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
            <StatCard
              title="Current Semester"
              value="Fall 2025"
              icon={Activity}
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </>
        )}
      </div>

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Charts Section */}
          <div className="space-y-6">
            {/* Enrollment Trend Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Enrollment Trend (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.enrollmentByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="enrollments" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Student Status Distribution */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Student Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course Popularity Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Most Popular Courses</h3>
            <ResponsiveContainer width="100%" height={520}>
              <BarChart data={chartData.coursePopularity} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="students" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
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
                      {new Date(student.enrollment_date).toLocaleDateString()}
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
    </div>
  )
}

export default Dashboard