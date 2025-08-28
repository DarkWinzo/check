import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { coursesAPI, registrationsAPI, studentsAPI } from '../services/api'
import { BookOpen, Users, Clock, Plus, Search, Filter, Edit, Eye, GraduationCap, Star, Calendar, User, Trash2, UserCheck, Mail, Phone, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import CourseModal from '../components/CourseModal'

const Courses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState({})
  const [deleteLoading, setDeleteLoading] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [pagination, setPagination] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [modalMode, setModalMode] = useState('create') // 'create', 'edit', 'view'
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses()
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchTerm])

  const fetchCourses = async (page = 1) => {
    const maxRetries = 3;
    let retryCount = 0;
    
    const attemptFetch = async () => {
      try {
        const params = {
          page,
          limit: 12,
          search: searchTerm
        }
        
        console.log('Fetching courses with params:', params);
        const response = await coursesAPI.getAll(params)
        console.log('Courses fetch successful:', response.data);
        setCourses(response.data.courses || [])
        setPagination(response.data.pagination || {})
      } catch (error) {
        console.error('Error fetching courses (attempt ' + (retryCount + 1) + '):', error);
        
        if (!error.response && retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`Retrying courses fetch... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptFetch();
        }
        
        let message = 'Failed to fetch courses. Please try again.';
        
        if (!error.response) {
          message = 'Connection failed. Please check your internet connection and ensure the backend server is running.';
        } else if (error.response?.status === 500) {
          message = 'Server error occurred. Please try again in a moment.';
        } else if (error.response?.status === 404) {
          message = 'Courses endpoint not found. Please check the server configuration.';
        } else if (error.response?.data?.message) {
          message = error.response.data.message;
        }
        
        toast.error(message);
        setCourses([])
        setPagination({})
      } finally {
        setLoading(false)
      }
    };
    
    return attemptFetch();
  }

  const handleRegister = async (courseId) => {
    try {
      setRegistering(prev => ({ ...prev, [courseId]: true }))
      
      await registrationsAPI.create({ courseId })
      toast.success('Successfully registered for course!')
      
      // Refresh courses to update enrollment count
      fetchCourses()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to register for course. Please try again.'
      toast.error(message)
    } finally {
      setRegistering(prev => ({ ...prev, [courseId]: false }))
    }
  }

  const handleCreateCourse = () => {
    setSelectedCourse(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewCourse = (course) => {
    setSelectedCourse(course)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.course_name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [course.id]: true }))
      await coursesAPI.delete(course.id)
      toast.success('Course deleted successfully')
      fetchCourses()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete course. Please try again.'
      toast.error(message)
    } finally {
      setDeleteLoading(prev => ({ ...prev, [course.id]: false }))
    }
  }

  const handleViewEnrollments = async (course) => {
    try {
      setEnrollmentLoading(true)
      setSelectedCourse(course)
      setShowEnrollmentModal(true)
      
      const response = await coursesAPI.getRegistrations(course.id)
      setEnrolledStudents(response.data || [])
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      const message = error.response?.data?.message || 'Failed to fetch course enrollments'
      toast.error(message)
      setEnrolledStudents([])
    } finally {
      setEnrollmentLoading(false)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedCourse(null)
  }

  const handleModalSuccess = () => {
    setShowModal(false)
    setSelectedCourse(null)
    fetchCourses()
  }

  const EnrollmentModal = () => {
    if (!showEnrollmentModal || !selectedCourse) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowEnrollmentModal(false)}
          />
          <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Course Enrollments</h3>
                  <p className="text-sm text-gray-600">{selectedCourse.course_name} ({selectedCourse.course_code})</p>
                </div>
              </div>
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">{enrolledStudents.length}</div>
                  <div className="text-sm text-gray-600">Total Enrolled</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">{selectedCourse.max_students}</div>
                  <div className="text-sm text-gray-600">Max Capacity</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedCourse.max_students - enrolledStudents.length}
                  </div>
                  <div className="text-sm text-gray-600">Available Spots</div>
                </div>
              </div>

              {/* Enrolled Students List */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Enrolled Students</h4>
                
                {enrollmentLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : enrolledStudents.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {enrolledStudents.map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white">
                              {registration.Student?.first_name?.charAt(0)}{registration.Student?.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {registration.Student?.first_name} {registration.Student?.last_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-4">
                              <span className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {registration.Student?.email}
                              </span>
                              <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                                ID: {registration.Student?.student_id}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            registration.status === 'enrolled'
                              ? 'bg-green-100 text-green-800'
                              : registration.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {registration.status}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(registration.registration_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <UserCheck className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enrollments Yet</h3>
                    <p className="text-gray-600">This course doesn't have any enrolled students yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const departments = [...new Set(courses.map(course => course.department).filter(Boolean))]
  const semesters = [...new Set(courses.map(course => course.semester).filter(Boolean))]

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading courses...</p>
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
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Courses</h1>
          </div>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage course offerings and view enrollments' : 'Browse and register for available courses'}
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button 
            onClick={handleCreateCourse}
            className="btn btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses by name, code, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 bg-white/50 backdrop-blur-sm border-white/30 focus:border-green-300 focus:ring-green-200"
              />
            </div>
            
            <div className="flex items-center justify-end">
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                  }}
                  className="btn btn-outline text-sm px-4 py-2"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          
          {searchTerm && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                {pagination.totalCount > 0 
                  ? `Found ${pagination.totalCount} course${pagination.totalCount !== 1 ? 's' : ''}`
                  : 'No courses found'
                } with current filters
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="glass-card rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              {/* Course Header */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b border-green-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-full">
                        Course
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                      {course.course_name}
                    </h3>
                  </div>
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                    {course.course_code}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                {course.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                )}

                <div className="space-y-3 mb-6">
                  {course.duration && (
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="p-1 bg-orange-100 rounded-lg mr-3">
                        <Clock className="h-3 w-3 text-orange-600" />
                      </div>
                      <span>{course.duration}</span>
                    </div>
                  )}
                  
                  {course.instructor && (
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="p-1 bg-blue-100 rounded-lg mr-3">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="font-medium">{course.instructor}</span>
                    </div>
                  )}
                  
                </div>

                {/* Enrollment Status */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Enrollment</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {course.dataValues?.enrolled_count || course.enrolled_count || 0}/{course.max_students}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(((course.dataValues?.enrolled_count || course.enrolled_count || 0) / course.max_students) * 100)}% full
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((course.dataValues?.enrolled_count || course.enrolled_count || 0) / course.max_students) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {user?.role === 'admin' ? (
                    <>
                      <button 
                        onClick={() => handleViewCourse(course)}
                        className="flex-1 min-w-0 btn btn-outline text-sm py-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleViewEnrollments(course)}
                          className="btn btn-secondary text-sm py-2 px-3"
                          title="View Enrollments"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditCourse(course)}
                          className="btn btn-primary text-sm py-2 px-3"
                          title="Edit Course"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(course)}
                          disabled={deleteLoading[course.id]}
                          className="btn btn-outline text-red-600 hover:bg-red-50 hover:border-red-300 text-sm py-2 px-3 disabled:opacity-50"
                          title="Delete Course"
                        >
                          {deleteLoading[course.id] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </>
                  ) : user?.role === 'student' && (
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => handleViewCourse(course)}
                        className="flex-1 btn btn-outline text-sm py-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => handleRegister(course.id)}
                        disabled={registering[course.id] || (course.dataValues?.enrolled_count || course.enrolled_count || 0) >= course.max_students}
                        className="flex-1 btn btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {registering[course.id] ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-1" />
                            Registering...
                          </>
                        ) : (course.dataValues?.enrolled_count || course.enrolled_count || 0) >= course.max_students ? (
                          'Course Full'
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-1" />
                            Register
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No courses found' : 'No courses available'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm
              ? 'No courses match your current filters. Try adjusting your search criteria.'
              : 'No courses have been added to the system yet.'
            }
          </p>
          
          {/* Retry button for connection issues */}
          <div className="flex flex-col items-center space-y-4">
            <button 
              onClick={() => fetchCourses()}
              className="btn btn-outline flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Loading</span>
            </button>
            
            <div className="text-sm text-gray-500 max-w-md">
              <p>If you're seeing connection errors:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check if the backend server is running on port 5000</li>
                <li>Verify your internet connection</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
          </div>
          
          {user?.role === 'admin' && !searchTerm && (
            <button 
              onClick={handleCreateCourse}
              className="btn btn-primary mt-4"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Course
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold">{((pagination.currentPage - 1) * 12) + 1}</span> to{' '}
            <span className="font-semibold">
              {Math.min(pagination.currentPage * 12, pagination.totalCount)}
            </span> of{' '}
            <span className="font-semibold">{pagination.totalCount}</span> courses
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchCourses(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => fetchCourses(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showModal && (
        <CourseModal
          isOpen={showModal}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          course={selectedCourse}
          mode={modalMode}
        />
      )}

      {/* Enrollment Modal */}
      <EnrollmentModal />
    </div>
  )
}

export default Courses