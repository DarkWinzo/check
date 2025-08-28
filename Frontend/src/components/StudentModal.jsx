import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, User, Mail, Phone, Calendar, MapPin, Save, Eye, Edit, BookOpen, Plus } from 'lucide-react'
import { studentsAPI, coursesAPI, registrationsAPI } from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

const StudentModal = ({ isOpen, onClose, onSuccess, student, mode = 'create' }) => {
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit')
  const [courses, setCourses] = useState([])
  const [selectedCourses, setSelectedCourses] = useState([])
  const [studentRegistrations, setStudentRegistrations] = useState([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [showCourseSelection, setShowCourseSelection] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm()

  useEffect(() => {
    if (isOpen) {
      fetchCourses()
      if (student && (mode === 'view' || mode === 'edit')) {
        fetchStudentRegistrations()
      }
    }
    
    if (student && isOpen) {
      setValue('firstName', student.first_name || '')
      setValue('lastName', student.last_name || '')
      setValue('email', student.email || '')
      setValue('phone', student.phone || '')
      setValue('dateOfBirth', student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '')
      setValue('address', student.address || '')
      setValue('studentId', student.student_id || '')
      setValue('gender', student.gender || '')
      setSelectedCourses([])
    } else if (mode === 'create') {
      reset()
      setSelectedCourses([])
      setStudentRegistrations([])
    }
  }, [student, isOpen, setValue, reset, mode])

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ limit: 100 })
      setCourses(response.data.courses)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchStudentRegistrations = async () => {
    if (!student?.id) return
    
    try {
      setLoadingRegistrations(true)
      const response = await studentsAPI.getRegistrations(student.id)
      
      const registrations = Array.isArray(response.data?.data) ? response.data.data : 
                           Array.isArray(response.data) ? response.data : []
      setStudentRegistrations(registrations)
    } catch (error) {
      console.error('Error fetching student registrations:', error);
      setStudentRegistrations([])
    } finally {
      setLoadingRegistrations(false)
    }
  }
  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId)
      } else {
        return [...prev, courseId]
      }
    })
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (mode === 'create') {
        const studentResponse = await studentsAPI.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          studentId: data.studentId,
          gender: data.gender
        })
        
        // Enroll student in selected courses
        if (selectedCourses.length > 0) {
          const createdStudent = studentResponse.data.student
          try {
            await studentsAPI.enrollInCourses(createdStudent.id, selectedCourses)
            toast.success(`Student created and enrolled in ${selectedCourses.length} course${selectedCourses.length !== 1 ? 's' : ''}!`)
          } catch (enrollError) {
            console.error('Error enrolling in courses:', enrollError)
            toast.success('Student created successfully!')
            toast.error('Some courses could not be enrolled. Please check manually.')
          }
        } else {
          toast.success('Student created successfully!')
        }
      } else {
        await studentsAPI.update(student.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          gender: data.gender
        })
        toast.success('Student updated successfully!')
      }
      onSuccess()
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} student:`, error);
      const message = error.response?.data?.message || 
        error.response?.data?.error || 
        `Failed to ${mode === 'create' ? 'create' : 'update'} student. Please try again.`
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleUnenrollFromCourse = async (registrationId) => {
    if (!window.confirm('Are you sure you want to drop this course?')) {
      return
    }

    try {
      await registrationsAPI.delete(registrationId)
      toast.success('Course dropped successfully')
      fetchStudentRegistrations()
    } catch (error) {
      console.error('Error dropping course:', error)
      toast.error('Failed to drop course')
    }
  }

  const handleAddCourses = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course')
      return
    }

    try {
      await studentsAPI.enrollInCourses(student.id, selectedCourses)
      toast.success(`Enrolled in ${selectedCourses.length} course${selectedCourses.length !== 1 ? 's' : ''}!`)
      setSelectedCourses([])
      setShowCourseSelection(false)
      fetchStudentRegistrations()
    } catch (error) {
      console.error('Error enrolling in courses:', error)
      toast.error('Failed to enroll in courses')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form to original values
    if (student) {
      setValue('firstName', student.first_name || '')
      setValue('lastName', student.last_name || '')
      setValue('email', student.email || '')
      setValue('phone', student.phone || '')
      setValue('dateOfBirth', student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '')
      setValue('address', student.address || '')
      setValue('studentId', student.student_id || '')
      setValue('gender', student.gender || '')
      setSelectedCourses([])
    }
  }

  if (!isOpen) return null

  const modalTitle = mode === 'create' ? 'Add New Student' : mode === 'edit' ? 'Edit Student' : 'Student Details'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{modalTitle}</h3>
                {student && (
                  <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'view' && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Edit Student"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    type="text"
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    type="text"
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student ID *
                </label>
                <input
                  {...register('studentId', { required: 'Student ID is required' })}
                  type="text"
                  disabled={!isEditing || mode === 'edit'}
                  className={`input font-mono ${!isEditing || mode === 'edit' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter student ID"
                />
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                )}
                {mode === 'edit' && (
                  <p className="mt-1 text-xs text-gray-500">Student ID cannot be changed</p>
                )}
              </div>

              {/* Email */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    disabled={!isEditing || mode === 'edit'}
                    className={`input pl-10 ${!isEditing || mode === 'edit' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
                {mode === 'edit' && (
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  {...register('gender')}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              {/* Course Enrollment (only for create mode) */}
              {mode === 'create' && (
                <>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enroll in Courses (Optional)
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                    {courses.length > 0 ? (
                      <div className="space-y-2">
                        {courses.map(course => (
                          <label key={course.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors duration-200">
                            <input
                              type="checkbox"
                              checked={selectedCourses.includes(course.id)}
                              onChange={() => handleCourseToggle(course.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                                  {course.course_code}
                                </span>
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {course.course_name}
                                </span>
                              </div>
                              {course.instructor && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Instructor: {course.instructor}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No courses available</p>
                      </div>
                    )}
                  </div>
                  {selectedCourses.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                </>
              )}
              {/* Address */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    {...register('address')}
                    rows={3}
                    disabled={!isEditing}
                    className={`input pl-10 resize-none ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              {/* Current Registrations (only for view/edit mode) */}
              {(mode === 'view' || mode === 'edit') && student && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center justify-between">
                      <span>Current Course Registrations</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => fetchStudentRegistrations()}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Refresh
                        </button>
                      )}
                    </div>
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                    {loadingRegistrations ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-gray-500">Loading registrations...</span>
                      </div>
                    ) : studentRegistrations.length > 0 ? (
                      <div className="space-y-3">
                        {studentRegistrations.map(registration => (
                          <div key={registration.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 group">
                            <div className="flex items-center space-x-3">
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
                                  {registration.Course?.duration && (
                                    <span className="ml-2">• Duration: {registration.Course.duration}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                registration.status === 'enrolled' 
                                  ? 'bg-green-100 text-green-800' 
                                  : registration.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {registration.status}
                              </span>
                              {isEditing && (registration.status === 'enrolled' || registration.status === 'dropped') && (
                                <button
                                  type="button"
                                  onClick={() => handleUnenrollFromCourse(registration.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                                  title="Drop Course"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No course registrations found</p>
                        <p className="text-xs text-gray-400 mt-1">This student is not currently enrolled in any courses</p>
                        {isEditing && !showCourseSelection && (
                          <button
                            type="button"
                            onClick={() => setShowCourseSelection(true)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium underline hover:no-underline transition-all duration-200"
                          >
                            Add Courses
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Add Course Selection for Edit Mode */}
                  {isEditing && studentRegistrations.length > 0 && !showCourseSelection && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setShowCourseSelection(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center underline hover:no-underline transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add More Courses
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Course Selection Modal for Edit Mode */}
              {isEditing && showCourseSelection && (
                <div className="md:col-span-2 lg:col-span-3">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-blue-900">Add Courses</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCourseSelection(false)
                          setSelectedCourses([])
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto mb-4">
                      {courses.length > 0 ? (
                        <div className="space-y-2">
                          {courses
                            .filter(course => !studentRegistrations.some(reg => reg.Course?.id === course.id && (reg.status === 'enrolled' || reg.status === 'completed')))
                            .map(course => (
                            <label key={course.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors duration-200">
                              <input
                                type="checkbox"
                                checked={selectedCourses.includes(course.id)}
                                onChange={() => handleCourseToggle(course.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                                    {course.course_code}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {course.course_name}
                                  </span>
                                </div>
                                {course.instructor && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Instructor: {course.instructor}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No additional courses available</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCourses}
                        disabled={selectedCourses.length === 0}
                        className="btn btn-primary text-sm py-2 px-4 disabled:opacity-50"
                      >
                        Add Selected Courses
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  {mode === 'view' && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-outline"
                    disabled={loading}
                  >
                    {mode === 'create' ? 'Cancel' : 'Close'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>{mode === 'create' ? 'Creating...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{mode === 'create' ? 'Create Student' : 'Save Changes'}</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline"
                >
                  Close
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentModal