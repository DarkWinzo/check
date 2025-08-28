import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, HelpCircle, Mail, Phone, MessageCircle, Send, ExternalLink, Book, Video, FileText, Users, Zap, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

const SupportModal = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('contact')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      // Create email content
      const subject = `Support Request: ${data.subject}`
      const body = `
Hello Support Team,

User Details:
- Email: ${user?.email}
- Role: ${user?.role}
- Current Page: ${window.location.pathname}

Issue Category: ${data.category}
Priority: ${data.priority}

Description:
${data.description}

Steps to Reproduce (if applicable):
${data.steps || 'N/A'}

Expected Behavior:
${data.expected || 'N/A'}

Additional Information:
${data.additional || 'N/A'}

Best regards,
${user?.email}
      `.trim()

      // Create mailto link
      const mailtoLink = `mailto:taskflowt@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      
      // Open email client
      window.open(mailtoLink, '_blank')
      
      toast.success('Email client opened! Please send the email to complete your support request.')
      reset()
      onClose()
    } catch (error) {
      console.error('Error creating support request:', error)
      toast.error('Failed to create support request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickContact = (method) => {
    switch (method) {
      case 'email':
        window.open('mailto:taskflowt@gmail.com?subject=Quick Support Request', '_blank')
        toast.success('Email client opened!')
        break
      case 'phone':
        toast.info('Phone support coming soon!')
        break
      case 'chat':
        toast.info('Live chat coming soon!')
        break
      default:
        break
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'contact', label: 'Contact Support', icon: Mail },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'resources', label: 'Resources', icon: Book },
    { id: 'status', label: 'System Status', icon: Zap }
  ]

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Contact your administrator to reset your password. Password self-service is coming soon.'
    },
    {
      question: 'How do I register for a course?',
      answer: 'Go to the Courses page, find the course you want, and click the "Register" button. Make sure the course has available spots.'
    },
    {
      question: 'Can I drop a course after registering?',
      answer: 'Yes, you can drop courses from your student dashboard. Click on "My Courses" and use the drop option next to each course.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Click on your profile picture in the top right corner and select "Profile Settings" to update your information.'
    },
    {
      question: 'Who can I contact for technical issues?',
      answer: 'Use this support form to contact our technical team, or email us directly at taskflowt@gmail.com.'
    }
  ]

  const resources = [
    {
      title: 'User Guide',
      description: 'Complete guide on how to use the Student Registration System',
      icon: Book,
      action: () => toast.info('User guide coming soon!')
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video tutorials for common tasks',
      icon: Video,
      action: () => toast.info('Video tutorials coming soon!')
    },
    {
      title: 'System Documentation',
      description: 'Technical documentation and API references',
      icon: FileText,
      action: () => toast.info('Documentation coming soon!')
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users and get help from the community',
      icon: Users,
      action: () => toast.info('Community forum coming soon!')
    }
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
        <div className="inline-block w-full max-w-5xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Help & Support</h3>
                <p className="text-sm text-gray-600">Get help and find answers to your questions</p>
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
                {/* Quick Actions */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Contact</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleQuickContact('email')}
                      className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email Support</span>
                    </button>
                    <button
                      onClick={() => handleQuickContact('phone')}
                      className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Phone Support</span>
                    </button>
                    <button
                      onClick={() => handleQuickContact('chat')}
                      className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Live Chat</span>
                    </button>
                  </div>
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
              {/* Contact Support Tab */}
              {activeTab === 'contact' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h4>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          {...register('category', { required: 'Please select a category' })}
                          className="input"
                        >
                          <option value="">Select a category</option>
                          <option value="technical">Technical Issue</option>
                          <option value="account">Account Problem</option>
                          <option value="course">Course Registration</option>
                          <option value="billing">Billing Question</option>
                          <option value="feature">Feature Request</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                        )}
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority *
                        </label>
                        <select
                          {...register('priority', { required: 'Please select priority' })}
                          className="input"
                        >
                          <option value="">Select priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                        {errors.priority && (
                          <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        {...register('subject', { required: 'Subject is required' })}
                        type="text"
                        className="input"
                        placeholder="Brief description of your issue"
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={4}
                        className="input resize-none"
                        placeholder="Please describe your issue in detail..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Steps to Reproduce */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Steps to Reproduce (Optional)
                      </label>
                      <textarea
                        {...register('steps')}
                        rows={3}
                        className="input resize-none"
                        placeholder="1. Go to...\n2. Click on...\n3. See error..."
                      />
                    </div>

                    {/* Expected Behavior */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Behavior (Optional)
                      </label>
                      <textarea
                        {...register('expected')}
                        rows={2}
                        className="input resize-none"
                        placeholder="What did you expect to happen?"
                      />
                    </div>

                    {/* Additional Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Information (Optional)
                      </label>
                      <textarea
                        {...register('additional')}
                        rows={2}
                        className="input resize-none"
                        placeholder="Any other relevant information..."
                      />
                    </div>

                    {/* User Info Display */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Your Information</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Email:</strong> {user?.email}</div>
                        <div><strong>Role:</strong> {user?.role}</div>
                        <div><strong>Current Page:</strong> {window.location.pathname}</div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary flex items-center space-x-2"
                      >
                        {submitting ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Send Support Request</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* FAQ Tab */}
              {activeTab === 'faq' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h4>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">{faq.question}</h5>
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Help Resources</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((resource, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <resource.icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">{resource.title}</h5>
                            <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                            <button
                              onClick={resource.action}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                            >
                              Learn More
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Status Tab */}
              {activeTab === 'status' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">System Status</h4>
                  <div className="space-y-4">
                    {[
                      { service: 'Web Application', status: 'operational', uptime: '99.9%' },
                      { service: 'Database', status: 'operational', uptime: '99.8%' },
                      { service: 'Authentication', status: 'operational', uptime: '100%' },
                      { service: 'Email Service', status: 'operational', uptime: '99.5%' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="font-medium text-gray-900">{item.service}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">Uptime: {item.uptime}</span>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 text-green-600 mr-2" />
                      <h5 className="font-medium text-green-800">All Systems Operational</h5>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      All services are running normally. Last updated: {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportModal