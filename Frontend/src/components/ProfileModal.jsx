import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, User, Mail, Phone, Calendar, MapPin, Save, Edit, Shield, Key, Bell, Globe, Palette, Moon, Sun } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI, studentsAPI } from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, checkAuthStatus } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [studentData, setStudentData] = useState(null)
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm()

  useEffect(() => {
    if (isOpen && user) {
      fetchUserData()
    }
  }, [isOpen, user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Get user profile
      const profileResponse = await authAPI.getProfile()
      
      // If user is a student, get student details
      if (user.role === 'student') {
        try {
          const studentResponse = await studentsAPI.getById('me')
          setStudentData(studentResponse.data)
          
          // Populate form with student data
          setValue('firstName', studentResponse.data.first_name || '')
          setValue('lastName', studentResponse.data.last_name || '')
          setValue('email', studentResponse.data.email || '')
          setValue('phone', studentResponse.data.phone || '')
          setValue('dateOfBirth', studentResponse.data.date_of_birth ? 
            new Date(studentResponse.data.date_of_birth).toISOString().split('T')[0] : '')
          setValue('address', studentResponse.data.address || '')
          setValue('gender', studentResponse.data.gender || '')
        } catch (error) {
          console.error('Error fetching student data:', error)
        }
      } else {
        // For admin users, just set email
        setValue('email', user.email || '')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (user.role === 'student' && studentData) {
        // Update student profile
        await studentsAPI.update(studentData.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          gender: data.gender
        })
        toast.success('Profile updated successfully!')
        
        // Refresh auth status to get updated user data
        await checkAuthStatus()
      } else {
        toast.info('Profile updates for admin users coming soon!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${notifications[type] ? 'disabled' : 'enabled'}`)
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
    // Here you would typically save to localStorage and apply theme
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
                <p className="text-sm text-gray-600">Manage your account settings and preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <div className="p-6">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    {studentData ? `${studentData.first_name} ${studentData.last_name}` : user?.email?.split('@')[0]}
                  </h4>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <>
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                      
                      {user?.role === 'student' ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  {...register('firstName', { required: 'First name is required' })}
                                  type="text"
                                  className="input pl-10"
                                  placeholder="Enter first name"
                                />
                              </div>
                              {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                              )}
                            </div>

                            {/* Last Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  {...register('lastName', { required: 'Last name is required' })}
                                  type="text"
                                  className="input pl-10"
                                  placeholder="Enter last name"
                                />
                              </div>
                              {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                              )}
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  {...register('email')}
                                  type="email"
                                  disabled
                                  className="input pl-10 bg-gray-50 cursor-not-allowed"
                                  placeholder="Email address"
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                            </div>

                            {/* Phone */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                              </label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  {...register('phone')}
                                  type="tel"
                                  className="input pl-10"
                                  placeholder="Enter phone number"
                                />
                              </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth
                              </label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  {...register('dateOfBirth')}
                                  type="date"
                                  className="input pl-10"
                                />
                              </div>
                            </div>

                            {/* Gender */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                              </label>
                              <select
                                {...register('gender')}
                                className="input"
                              >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                              </select>
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <textarea
                                {...register('address')}
                                rows={3}
                                className="input pl-10 resize-none"
                                placeholder="Enter full address"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={loading}
                              className="btn btn-primary flex items-center space-x-2"
                            >
                              {loading ? (
                                <>
                                  <LoadingSpinner size="sm" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  <span>Save Changes</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Profile</h3>
                          <p className="text-gray-600 mb-4">
                            Admin profile management is coming soon.
                          </p>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600">
                              <strong>Email:</strong> {user?.email}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <strong>Role:</strong> Administrator
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h4>
                      <div className="space-y-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <Key className="h-5 w-5 text-yellow-600 mr-2" />
                            <h5 className="font-medium text-yellow-800">Password Management</h5>
                          </div>
                          <p className="text-sm text-yellow-700 mt-2">
                            Password change functionality is coming soon. Contact your administrator for password resets.
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <Shield className="h-5 w-5 text-blue-600 mr-2" />
                            <h5 className="font-medium text-blue-800">Account Security</h5>
                          </div>
                          <p className="text-sm text-blue-700 mt-2">
                            Your account is secured with industry-standard encryption and authentication.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preferences Tab */}
                  {activeTab === 'preferences' && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h4>
                      <div className="space-y-6">
                        {/* Theme Selection */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Theme</h5>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: 'light', label: 'Light', icon: Sun },
                              { id: 'dark', label: 'Dark', icon: Moon },
                              { id: 'auto', label: 'Auto', icon: Globe }
                            ].map((themeOption) => (
                              <button
                                key={themeOption.id}
                                onClick={() => handleThemeChange(themeOption.id)}
                                className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors duration-200 ${
                                  theme === themeOption.id
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <themeOption.icon className="h-6 w-6" />
                                <span className="text-sm font-medium">{themeOption.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Language */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Language</h5>
                          <select className="input max-w-xs">
                            <option value="en">English</option>
                            <option value="es">Spanish (Coming Soon)</option>
                            <option value="fr">French (Coming Soon)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h4>
                      <div className="space-y-4">
                        {Object.entries(notifications).map(([type, enabled]) => (
                          <div key={type} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                              <h5 className="font-medium text-gray-900 capitalize">{type} Notifications</h5>
                              <p className="text-sm text-gray-600">
                                Receive {type} notifications for important updates
                              </p>
                            </div>
                            <button
                              onClick={() => handleNotificationChange(type)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                enabled ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                  enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal