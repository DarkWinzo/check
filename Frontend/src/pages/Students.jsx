import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { studentsAPI } from '../services/api'
import { Search, Users, Mail, Phone, Calendar, Plus, Edit, Eye, UserPlus, GraduationCap, Trash2, Filter } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import StudentModal from '../components/StudentModal'
import toast from 'react-hot-toast'

const Students = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [pagination, setPagination] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [modalMode, setModalMode] = useState('create') // 'create', 'edit', 'view'
  const [deleteLoading, setDeleteLoading] = useState({})

  useEffect(() => {
    fetchStudents()
  }, [searchTerm])

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        search: searchTerm
      }

      const response = await studentsAPI.getAll(params)
      setStudents(response.data.students || [])
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error('Error fetching students:', error)
      const message = error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch students. Please check your connection and try again.'
      toast.error(message)
      setStudents([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = () => {
    setSelectedStudent(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [student.id]: true }))
      await studentsAPI.delete(student.id)
      toast.success('Student deleted successfully')
      fetchStudents()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete student'
      toast.error(message)
    } finally {
      setDeleteLoading(prev => ({ ...prev, [student.id]: false }))
    }
  }
  const handleModalClose = () => {
    setShowModal(false)
    setSelectedStudent(null)
  }

  const handleModalSuccess = () => {
    setShowModal(false)
    setSelectedStudent(null)
    fetchStudents()
  }

  // Show access denied only for non-admin users
  if (user?.role !== 'admin' && user?.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to view student records.
          </p>
          <div className="text-sm text-gray-500">
            Contact your administrator for access.
          </div>
        </div>
      </div>
    )
  }

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading students...</p>
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
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Students</h1>
          </div>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? 'Manage student accounts and view enrollment information'
              : 'View student directory and information'
            }
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button 
            onClick={handleCreateStudent}
            className="btn btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full bg-white/50 backdrop-blur-sm border-white/30 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            
            <div className="flex items-center justify-end lg:col-span-2">
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
                  ? `Found ${pagination.totalCount} student${pagination.totalCount !== 1 ? 's' : ''}`
                  : 'No students found'
                } with current filters
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Students Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : students.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="glass-card rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="table-head text-left">Student</th>
                      <th className="table-head text-left">Student ID</th>
                      <th className="table-head text-left">Contact</th>
                      <th className="table-head text-left">Gender</th>
                      <th className="table-head text-left">Enrollment</th>
                      <th className="table-head text-left">Status</th>
                      {user?.role === 'admin' && (
                        <th className="table-head text-center">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                      <tr key={student.id} className="table-row hover:bg-blue-50/50 transition-colors duration-200">
                        <td className="table-cell">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <span className="text-sm font-bold text-white">
                                  {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded-lg">
                            {student.student_id}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="space-y-1">
                            {student.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                {student.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          {student.gender && (
                            <span className="text-sm text-gray-600 capitalize">
                              {student.gender.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {new Date(student.enrollment_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                            student.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        {user?.role === 'admin' && (
                          <td className="table-cell">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleViewStudent(student)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditStudent(student)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                title="Edit Student"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student)}
                                disabled={deleteLoading[student.id]}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Delete Student"
                              >
                                {deleteLoading[student.id] ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {students.map((student) => (
              <div key={student.id} className="glass-card rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold text-white">
                          {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">
                          {student.student_id}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {student.email}
                    </div>
                    {student.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {student.phone}
                      </div>
                    )}
                    {student.gender && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="capitalize">{student.gender.replace('_', ' ')}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <div className="flex space-x-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="flex-1 btn btn-outline text-sm py-2"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="flex-1 btn btn-primary text-sm py-2"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        disabled={deleteLoading[student.id]}
                        className="btn btn-outline text-red-600 hover:bg-red-50 hover:border-red-300 text-sm py-2 px-3 disabled:opacity-50"
                      >
                        {deleteLoading[student.id] ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No students found' : 'No students yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm
              ? 'No students match your current filters. Try adjusting your search criteria.'
              : 'Get started by adding your first student to the system.'
            }
          </p>
          {user?.role === 'admin' && !searchTerm && (
            <button 
              onClick={handleCreateStudent}
              className="btn btn-primary"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add First Student
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold">{((pagination.currentPage - 1) * 10) + 1}</span> to{' '}
            <span className="font-semibold">
              {Math.min(pagination.currentPage * 10, pagination.totalCount)}
            </span> of{' '}
            <span className="font-semibold">{pagination.totalCount}</span> students
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchStudents(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => fetchStudents(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {showModal && (
        <StudentModal
          isOpen={showModal}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          student={selectedStudent}
          mode={modalMode}
        />
      )}
    </div>
  )
}

export default Students