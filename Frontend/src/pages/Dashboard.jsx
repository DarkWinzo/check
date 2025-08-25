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
  Star,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  BookMarked,
  Target
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    activeStudents: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentRegistrations, setStudentRegistrations] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'admin') {
        // Fetch admin dashboard data
        const [studentsRes, coursesRes, registrationsRes] = await Promise.all([
          studentsAPI.getAll({ limit: 100 }),
          coursesAPI.getAll({ limit: 100 }),
          registrationsAPI.getAll({ limit: 100 })
        ])

        const students = studentsRes.data.students || []
        const courses = coursesRes.data.courses || []
        const registrations = registrationsRes.data.registrations || []

        setStats({
          totalStudents: students.length,
          totalCourses: courses.length,
          totalRegistrations: registrations.length,
          activeStudents: students.filter(s => s.status === 'active').length
        })

        // Set recent activity (recent registrations)
        setRecentActivity(registrations.slice(0, 5))
      } else if (user?.role === 'student') {
        // Fetch student dashboard data
        try {
          const registrationsRes = await studentsAPI.getRegistrations('me')
          const registrations = Array.isArray(registrationsRes.data?.data) ? registrationsRes.data.data : 
                               Array.isArray(registrationsRes.data) ? registrationsRes.data : []
          setStudentRegistrations(registrations)
          
          setStats({
            totalRegistrations: registrations.length,
            activeRegistrations: registrations.filter(r => r.status === 'enrolled').length,
            completedRegistrations: registrations.filter(r => r.status === 'completed').length,
            droppedRegistrations: registrations.filter(r => r.status === 'dropped').length
          })
        } catch (error) {
          console.error('Error fetching student registrations:', error)
          setStudentRegistrations([])
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, trend, description }) => (
    <div className="glass-card rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </div>
    </div>
  )

  const AdminDashboard = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="from-blue-500 to-blue-600"
          description="Registered students"
        />
        <StatCard
          title="Active Students"
          value={stats.activeStudents}
          icon={UserCheck}
          color="from-green-500 to-green-600"
          description="Currently active"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          color="from-purple-500 to-purple-600"
          description="Available courses"
        />
        <StatCard
          title="Total Enrollments"
          value={stats.totalRegistrations}
          icon={GraduationCap}
          color="from-orange-500 to-orange-600"
          description="Course registrations"
        />
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl border border-white/20 shadow-lg">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          </div>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookMarked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.Student?.first_name} {activity.Student?.last_name} enrolled in {activity.Course?.course_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.registration_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    activity.status === 'enrolled'
                      ? 'bg-green-100 text-green-800'
                      : activity.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const StudentDashboard = () => (
    <div className="space-y-8">
      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={stats.totalRegistrations}
          icon={BookOpen}
          color="from-blue-500 to-blue-600"
          description="Registered courses"
        />
        <StatCard
          title="Active Enrollments"
          value={stats.activeRegistrations}
          icon={UserCheck}
          color="from-green-500 to-green-600"
          description="Currently enrolled"
        />
        <StatCard
          title="Completed"
          value={stats.completedRegistrations}
          icon={Award}
          color="from-purple-500 to-purple-600"
          description="Courses completed"
        />
        <StatCard
          title="Dropped"
          value={stats.droppedRegistrations}
          icon={Target}
          color="from-red-500 to-red-600"
          description="Courses dropped"
        />
      </div>

      {/* My Courses */}
      <div className="glass-card rounded-2xl border border-white/20 shadow-lg">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">My Courses</h3>
          </div>
        </div>
        <div className="p-6">
          {studentRegistrations.length > 0 ? (
            <div className="space-y-4">
              {studentRegistrations.map((registration) => (
                <div key={registration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                          {registration.Course?.course_code}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {registration.Course?.course_name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Registered: {new Date(registration.registration_date).toLocaleDateString()}
                        {registration.Course?.instructor && (
                          <span className="ml-2">• Instructor: {registration.Course.instructor}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
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
              <p className="text-gray-500 mb-2">No course registrations yet</p>
              <p className="text-sm text-gray-400">Visit the Courses page to register for classes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Welcome back, {user?.email}! Here's your {user?.role === 'admin' ? 'system' : 'learning'} overview.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Role-specific Dashboard */}
      {user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  )
}

export default Dashboard