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
  Minus
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
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

  // Stable chart data - won't change unless explicitly updated
  const enrollmentTrendData = useMemo(() => [
    { month: 'Jan', students: 45, courses: 12 },
    { month: 'Feb', students: 52, courses: 15 },
    { month: 'Mar', students: 48, courses: 14 },
    { month: 'Apr', students: 61, courses: 18 },
    { month: 'May', students: 55, courses: 16 },
    { month: 'Jun', students: 67, courses: 20 }
  ], [])

  const studentStatusData = useMemo(() => [
    { name: 'Active', value: 85, color: '#10B981' },
    { name: 'Inactive', value: 12, color: '#F59E0B' },
    { name: 'Graduated', value: 3, color: '#8B5CF6' }
  ], [])

  const popularCoursesData = useMemo(() => [
    { name: 'Computer Science', students: 45, growth: 12 },
    { name: 'Mathematics', students: 38, growth: 8 },
    { name: 'Physics', students: 32, growth: -2 },
    { name: 'Chemistry', students: 28, growth: 15 },
    { name: 'Biology', students: 25, growth: 5 }
  ], [])

  const performanceData = useMemo(() => [
    { month: 'Jan', performance: 78 },
    { month: 'Feb', performance: 82 },
    { month: 'Mar', performance: 79 },
    { month: 'Apr', performance: 85 },
    { month: 'May', performance: 88 },
    { month: 'Jun', performance: 92 }
  ], [])

  useEffect(() => {
    fetchDashboardData()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (user?.role === 'admin') {
        try {
          // Fetch admin data with better error handling
          const studentsRes = await studentsAPI.getAll({ limit: 100 }).catch((error) => {
            console.warn('Error fetching students:', error.message);
            return { data: { pagination: { totalCount: 0 }, students: [] } };
          })
          
          const coursesRes = await coursesAPI.getAll({ limit: 100 }).catch((error) => {
            console.warn('Error fetching courses:', error.message);
            return { data: { pagination: { totalCount: 0 }, courses: [] } };
          })
          
          const registrationsRes = await registrationsAPI.getAll({ limit: 10 }).catch((error) => {
            console.warn('Error fetching registrations:', error.message);
            return { data: { pagination: { totalCount: 0 }, registrations: [] } };
          })

          const studentsData = studentsRes.data || {}
          const coursesData = coursesRes.data || {}
          const registrationsData = registrationsRes.data || {}

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
          console.error('Error fetching admin data:', error);
          setError('Failed to load admin dashboard data. Some features may be limited.')
          // Set default stats even on error
          setStats({
            totalStudents: 0,
            totalCourses: 0,
            totalRegistrations: 0,
            activeStudents: 0,
            availableCourses: 0,
            myRegistrations: 0,
            completedCourses: 0
          })
          setRecentActivity([])
        }
      } else {
        try {
          // Fetch student data with better error handling
          const coursesRes = await coursesAPI.getAll({ limit: 20 }).catch((error) => {
            console.warn('Error fetching courses for student:', error.message);
            return { data: { pagination: { totalCount: 0 }, courses: [] } };
          })
          
          // For students, try to get their registrations
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
            console.warn('Error fetching student registrations:', error.message);
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
          console.error('Error fetching student data:', error);
          setError('Failed to load student dashboard data. Some features may be limited.')
          setStats({
            totalStudents: 0,
            totalCourses: 0,
            totalRegistrations: 0,
            activeStudents: 0,
            availableCourses: 0,
            myRegistrations: 0,
            completedCourses: 0
          })
        }
      }
      setDataLoaded(true)
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.')
      setStats({
        totalStudents: 0,
        totalCourses: 0,
        totalRegistrations: 0,
        activeStudents: 0,
        availableCourses: 0,
        myRegistrations: 0,
        completedCourses: 0
      })
    } finally {
      setLoading(false)
    }
  }, [user?.role])

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
              trend === 'up' ? 'bg-green-100 text-green-800' : 
              trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {trend === 'up' ? <ChevronUp className="h-3 w-3" /> : 
               trend === 'down' ? <ChevronDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
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
        <div className="h-full bg-white/40 rounded-full transition-all duration-1000" style={{ width: '70%' }}></div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
    >
      <div className={`inline-flex p-3 rounded-xl ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
        <span>Get started</span>
        <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
      </div>
    </div>
  )

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <UserCheck className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {activity.Student?.first_name} {activity.Student?.last_name}
        </p>
        <p className="text-xs text-gray-500">
          Registered for {activity.Course?.course_name}
        </p>
      </div>
      <div className="text-xs text-gray-400">
        {new Date(activity.registration_date).toLocaleDateString()}
      </div>
    </div>
  )

  const ChartCard = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      {children}
    </div>
  )

  // Show loading screen only on initial load
  if (loading && !dataLoaded) {
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
                    Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
                  </h1>
                  <p className="text-white/80 text-lg mt-1">
                    {user?.role === 'admin' ? 'System Administrator' : 'Student Portal'}
                  </p>
                </div>
              </div>
              <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
                {user?.role === 'admin' 
                  ? 'Monitor your institution\'s performance and manage student registrations with powerful insights.'
                  : 'Explore courses, track your progress, and manage your academic journey seamlessly.'
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

      {/* Stats Grid */}
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
              title="Active Courses"
              value={stats.totalCourses}
              icon={BookOpen}
              trend="up"
              trendValue="8"
              color="bg-gradient-to-r from-green-500 to-green-600"
              bgGradient="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatCard
              title="Total Registrations"
              value={stats.totalRegistrations}
              icon={TrendingUp}
              trend="up"
              trendValue="24"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatCard
              title="Active Students"
              value={stats.activeStudents}
              icon={Activity}
              trend="up"
              trendValue="5"
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
              value={stats.myRegistrations || 0}
              icon={Award}
              color="bg-gradient-to-r from-green-500 to-green-600"
              bgGradient="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatCard
              title="Completed Courses"
              value={stats.completedCourses || 0}
              icon={Target}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatCard
              title="Academic Year"
              value="2024-25"
              icon={Calendar}
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <Activity className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Dashboard Notice</h3>
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => {
                  setError(null)
                  fetchDashboardData()
                }}
                className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section - Only for Admin */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {/* Enrollment Trend Chart */}
          <ChartCard title="Enrollment Trend" icon={TrendingUp}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentTrendData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
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
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Student Status Pie Chart */}
          <ChartCard title="Student Status" icon={PieChart}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsPieChart.Pie
                    data={studentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {studentStatusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Popular Courses */}
          <ChartCard title="Popular Courses" icon={BookOpen}>
            <div className="space-y-4">
              {popularCoursesData.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{course.name}</div>
                      <div className="text-xs text-gray-500">{course.students} students</div>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    course.growth > 0 ? 'bg-green-100 text-green-800' : 
                    course.growth < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.growth > 0 ? <ChevronUp className="h-3 w-3" /> : 
                     course.growth < 0 ? <ChevronDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    <span>{Math.abs(course.growth)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="text-sm text-gray-500">Get things done faster</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user?.role === 'admin' ? (
                <>
                  <QuickActionCard
                    title="Add New Student"
                    description="Register a new student and set up their profile in the system."
                    icon={UserCheck}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={() => window.location.href = '/students'}
                  />
                  <QuickActionCard
                    title="Create Course"
                    description="Add a new course offering with detailed information and enrollment limits."
                    icon={BookMarked}
                    color="bg-gradient-to-r from-green-500 to-green-600"
                    onClick={() => window.location.href = '/courses'}
                  />
                  <QuickActionCard
                    title="View Analytics"
                    description="Access detailed reports and insights about student performance and enrollment trends."
                    icon={BarChart3}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                  />
                  <QuickActionCard
                    title="System Settings"
                    description="Configure system preferences, user permissions, and institutional settings."
                    icon={Globe}
                    color="bg-gradient-to-r from-orange-500 to-orange-600"
                  />
                </>
              ) : (
                <>
                  <QuickActionCard
                    title="Browse Courses"
                    description="Explore available courses and find the perfect fit for your academic goals."
                    icon={BookOpen}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={() => window.location.href = '/courses'}
                  />
                  <QuickActionCard
                    title="My Profile"
                    description="Update your personal information and academic preferences."
                    icon={Users}
                    color="bg-gradient-to-r from-green-500 to-green-600"
                    onClick={() => window.location.href = '/students'}
                  />
                  <QuickActionCard
                    title="Academic Calendar"
                    description="View important dates, deadlines, and upcoming academic events."
                    icon={Calendar}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                  />
                  <QuickActionCard
                    title="Support Center"
                    description="Get help with registration, technical issues, or academic guidance."
                    icon={Heart}
                    color="bg-gradient-to-r from-pink-500 to-pink-600"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity / Performance Insights */}
        <div className="space-y-6">
          {user?.role === 'admin' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance Insights */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold">
                {user?.role === 'admin' ? 'System Performance' : 'Your Progress'}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/90">
                    {user?.role === 'admin' ? 'Enrollment Rate' : 'Course Completion'}
                  </span>
                  <span className="text-sm font-bold">85%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/90">
                    {user?.role === 'admin' ? 'Student Satisfaction' : 'Academic Performance'}
                  </span>
                  <span className="text-sm font-bold">92%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-300 h-2 rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-white/80 text-xs">
                {user?.role === 'admin' 
                  ? 'System performance is excellent this semester!'
                  : 'Keep up the great work on your academic journey!'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard