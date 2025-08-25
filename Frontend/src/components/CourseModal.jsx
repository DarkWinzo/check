import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, BookOpen, User, Building, Calendar, Users, FileText, Save, Eye, Edit, Hash, Clock } from 'lucide-react'
import { coursesAPI } from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

const CourseModal = ({ isOpen, onClose, onSuccess, course, mode = 'create' }) => {
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm()

  useEffect(() => {
    if (course && isOpen) {
      setValue('courseCode', course.course_code || '')
      setValue('courseName', course.course_name || '')
      setValue('description', course.description || '')
      setValue('duration', course.duration || '')
      setValue('instructor', course.instructor || '')
      setValue('maxStudents', course.max_students || 30)
    } else if (mode === 'create') {
      reset({
        maxStudents: 30
      })
    }
  }, [course, isOpen, setValue, reset, mode])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (mode === 'create') {
        await coursesAPI.create({
          courseCode: data.courseCode,
          courseName: data.courseName,
          description: data.description,
          duration: data.duration,
          instructor: data.instructor,
          maxStudents: parseInt(data.maxStudents)
        })
        toast.success('Course created successfully!')
      } else {
        await coursesAPI.update(course.id, {
          courseName: data.courseName,
          description: data.description,
          duration: data.duration,
          instructor: data.instructor,
          maxStudents: parseInt(data.maxStudents)
        })
        toast.success('Course updated successfully!')
      }
      onSuccess()
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${mode === 'create' ? 'create' : 'update'} course`
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form to original values
    if (course) {
      setValue('courseCode', course.course_code || '')
      setValue('courseName', course.course_name || '')
      setValue('description', course.description || '')
      setValue('duration', course.duration || '')
      setValue('instructor', course.instructor || '')
      setValue('maxStudents', course.max_students || 30)
    }
  }

  if (!isOpen) return null

  const modalTitle = mode === 'create' ? 'Add New Course' : mode === 'edit' ? 'Edit Course' : 'Course Details'

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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{modalTitle}</h3>
                {course && (
                  <p className="text-sm text-gray-600">Code: {course.course_code}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'view' && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  title="Edit Course"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Code *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('courseCode', { required: 'Course code is required' })}
                    type="text"
                    disabled={!isEditing || mode === 'edit'}
                    className={`input pl-10 font-mono ${!isEditing || mode === 'edit' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="e.g., CS101"
                  />
                </div>
                {errors.courseCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.courseCode.message}</p>
                )}
                {mode === 'edit' && (
                  <p className="mt-1 text-xs text-gray-500">Course code cannot be changed</p>
                )}
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Name *
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('courseName', { required: 'Course name is required' })}
                    type="text"
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter course name"
                  />
                </div>
                {errors.courseName && (
                  <p className="mt-1 text-sm text-red-600">{errors.courseName.message}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('duration')}
                    type="text"
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="e.g., 6 months, 1 semester"
                  />
                </div>
              </div>

              {/* Max Students */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Students *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('maxStudents', { 
                      required: 'Max students is required',
                      min: { value: 1, message: 'Must be at least 1' },
                      max: { value: 200, message: 'Cannot exceed 200' }
                    })}
                    type="number"
                    min="1"
                    max="200"
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="30"
                  />
                </div>
                {errors.maxStudents && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>
                )}
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instructor
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('instructor')}
                    type="text"
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter instructor name"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    {...register('description')}
                    rows={4}
                    disabled={!isEditing}
                    className={`input pl-10 resize-none ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter course description..."
                  />
                </div>
              </div>
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
                        <span>{mode === 'create' ? 'Create Course' : 'Save Changes'}</span>
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

export default CourseModal