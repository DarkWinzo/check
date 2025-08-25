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
  XCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    activeStudents: 0
  })
  const [recentStudents, setRecentStudents] = useState([])
  const [recentCourses, setRecentCourses] = useState([])
  const [recentRegistrations, setRecentRegistrations] = useState([])
  const [chartData, setChartData] = useState([])
  const [pieData, setPieData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'admin') {
        await Promise.all([
          fetchStudents(),
          fetchCourses(),
          fetchRegistrations()
        ])
      } else if (user?.role === 'student') {
        await fetchStudentDashboard()
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll({ limit: 5 })
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
      const response = await coursesAPI.getAll({ limit: 5 })
      const courses = response.data?.courses || []
      setRecentCourses(courses)
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalCourses: response.data?.pagination?.totalCount || courses.length
      }))

      // Prepare chart data
      const chartData = courses.map(course => ({
        name: course.course_code,
        enrolled: course.enrolled_count || 0,
        capacity: course.max_students || 0
      }))
      setChartData(chartData)

      // Prepare pie data
      const pieData = [
        { name: 'Available Spots', value: courses.reduce((sum, course) => sum + (course.max_students - (course.enrolled_count || 0)), 0) },
        { name: 'Enrolled', value: courses.reduce((sum, course) => sum + (course.enrolled_count || 0), 0) }
      ]
      setPieData(pieData)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setRecentCourses([])
    }
  }

  const fetchRegistrations = async () => {
    try {
      const response = await registrationsAPI.getAll({ limit: 5 })
      const registrations = response.data?.registrations || []
      setRecentRegistrations(registrations)
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalRegistrations: response.data?.pagination?.totalCount || registrations.length
      }))
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRecentRegistrations([])
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
        activeStudents: registrations.filter(r => r.status === 'enrolled').length
      }))
    } catch (error) {
      console.error('Error fetching student dashboard:', error)
      setRecentRegistrations([])
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-8 lg:p-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    Welcome back, {user?.email?.split('@')[0]}!
                  </h1>
                  <p className="text-white/80 text-lg font-medium capitalize">
                    {user?.role} Dashboard
                  </p>
                </div>
              </div>
              <p className="text-white/90 text-lg max-w-2xl">
                {user?.role === 'admin' 
                  ? 'Manage your institution with powerful tools and insights.'
                  : 'Track your academic progress and manage your course enrollments.'
                }
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-300 fill-current animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'admin' ? (
          <>
            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Active: {stats.activeStudents}</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses}</p>
                  <div className="flex items-center mt-2">
                    <Activity className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">Available</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Registrations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRegistrations}</p>
                  <div className="flex items-center mt-2">
                    <UserCheck className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Enrolled</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">System Status</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">Online</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">All systems operational</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">My Courses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRegistrations}</p>
                  <div className="flex items-center mt-2">
                    <BookOpen className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">Enrolled</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Active Enrollments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeStudents}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">In Progress</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Academic Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">85%</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">On Track</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Next Deadline</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600 font-medium">Days Left</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section - Admin Only */}
      {user?.role === 'admin' && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Course Enrollment</h3>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Enrollment Distribution</h3>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students/Courses */}
        <div className="glass-card rounded-2xl border border-white/20 shadow-xl">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                  {user?.role === 'admin' ? <Users className="h-5 w-5 text-white" /> : <BookOpen className="h-5 w-5 text-white" />}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {user?.role === 'admin' ? 'Recent Students' : 'My Courses'}
                </h3>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {user?.role === 'admin' ? (
              recentStudents.length > 0 ? (
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-white">
                            {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No students found</p>
                </div>
              )
            ) : (
              recentRegistrations.length > 0 ? (
                <div className="space-y-4">
                  {recentRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {registration.Course?.course_name || 'Course'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {registration.Course?.course_code || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        registration.status === 'enrolled'
                          ? 'bg-green-100 text-green-800'
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
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No course enrollments found</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl border border-white/20 shadow-xl">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {user?.role === 'admin' && recentRegistrations.length > 0 ? (
              <div className="space-y-4">
                {recentRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {registration.Student?.first_name} {registration.Student?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Enrolled in {registration.Course?.course_name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(registration.registration_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Welcome to the system!</div>
                    <div className="text-sm text-gray-500">Your account has been set up successfully</div>
                  </div>
                  <div className="text-xs text-gray-400">Today</div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">System Status</div>
                    <div className="text-sm text-gray-500">All systems are operational</div>
                  </div>
                  <div className="text-xs text-gray-400">Now</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <Star className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {user?.role === 'admin' ? (
              <>
                <button className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900">Add Student</div>
                    <div className="text-sm text-gray-500">Register new student</div>
                  </div>
                </button>
                
                <button className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900">Add Course</div>
                    <div className="text-sm text-gray-500">Create new course</div>
                  </div>
                </button>
                
                <button className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 group">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900">View Reports</div>
                    <div className="text-sm text-gray-500">Analytics & insights</div>
                  </div>
                </button>
                
                <button className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 group">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900">Manage Enrollments</div>
                    <div className="text-sm text-gray-500">Course registrations</div>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900">Browse Courses</div>
                    <div className="text-sm text-gray-500">Find new courses</div>
                  </div>
                </button>
                
                <button className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 group">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900">My Courses</div>
                    <div className="text-sm text-gray-500">View enrollments</div>
                  </div>
                </button>
                
                <button className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900">Academic Progress</div>
                    <div className="text-sm text-gray-500">Track performance</div>
                  </div>
                </button>
                
                <button className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 group">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900">Schedule</div>
                    <div className="text-sm text-gray-500">View timetable</div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard