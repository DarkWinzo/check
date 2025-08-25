// Application Configuration
export const appConfig = {
  // App Information
  APP_NAME: 'Student Registration System',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'A comprehensive student registration and course management system',
  
  // UI Configuration
  UI: {
    THEME: 'light', // 'light' | 'dark' | 'auto'
    ITEMS_PER_PAGE: 10,
    MAX_ITEMS_PER_PAGE: 100,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  
  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    CHUNK_SIZE: 1024 * 1024 // 1MB chunks
  },
  
  // Validation
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
    PASSWORD_MIN_LENGTH: 6,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50
  },
  
  // Date/Time
  DATE_TIME: {
    DEFAULT_FORMAT: 'YYYY-MM-DD',
    DISPLAY_FORMAT: 'MMM DD, YYYY',
    TIME_FORMAT: 'HH:mm',
    TIMEZONE: 'UTC'
  },
  
  // Features
  FEATURES: {
    DARK_MODE: true,
    NOTIFICATIONS: true,
    ANALYTICS: false,
    OFFLINE_MODE: false,
    AUTO_SAVE: true
  },
  
  // Storage
  STORAGE: {
    PREFIX: 'srs_',
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    THEME_KEY: 'theme',
    LANGUAGE_KEY: 'language'
  },
  
  // Routes
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    STUDENTS: '/students',
    COURSES: '/courses',
    PROFILE: '/profile'
  }
}

export default appConfig