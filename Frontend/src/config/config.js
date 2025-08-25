// Frontend Configuration
const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  
  // App Configuration
  APP_NAME: 'Student Registration System',
  APP_VERSION: '1.0.0',
  
  // UI Configuration
  ITEMS_PER_PAGE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Features
  FEATURES: {
    DARK_MODE: true,
    NOTIFICATIONS: true,
    ANALYTICS: false
  }
}

export default config