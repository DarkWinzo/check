import dotenv from 'dotenv';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables if .env exists
try {
  dotenv.config();
} catch (error) {
  // .env file doesn't exist, use default values
}

// Get network IP
const getNetworkIP = () => {
  const networkInterfaces = os.networkInterfaces();
  
  for (const interfaceName of Object.keys(networkInterfaces)) {
    for (const netInterface of networkInterfaces[interfaceName]) {
      if (netInterface.family === 'IPv4' && !netInterface.internal) {
        return netInterface.address;
      }
    }
  }
  return 'localhost';
};

const networkIP = getNetworkIP();

// Main configuration object
export const config = {
  // Project Structure
  ROOT_DIR: __dirname,
  BACKEND_DIR: join(__dirname, 'Backend'),
  FRONTEND_DIR: join(__dirname, 'Frontend'),

  // Database Configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'student_registration',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'your_password',
  DATABASE_URL: process.env.DATABASE_URL || 'local',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_long_and_secure_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: '0.0.0.0',

  // Frontend Configuration
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  FRONTEND_PORT: 3000,

  // CORS Configuration
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    [
      'http://localhost:3000', 
      'http://127.0.0.1:3000', 
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      `http://${networkIP}:3000`,
      `http://${networkIP}:5173`
    ],

  // Default Admin User Configuration
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  ADMIN_FIRST_NAME: process.env.ADMIN_FIRST_NAME || 'System',
  ADMIN_LAST_NAME: process.env.ADMIN_LAST_NAME || 'Administrator',

  // Security Configuration
  BCRYPT_ROUNDS: 12,
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },

  // Database Configuration (Sequelize)
  DATABASE_CONFIG: {
    sqlite: {
      dialect: 'sqlite',
      storage: join(__dirname, 'Backend/database/store/student-registration.db'),
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    },
    postgres: {
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'student_registration',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_password',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
      }
    }
  },

  // API Configuration
  API: {
    BASE_URL: process.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : `http://${networkIP}:5000/api`),
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },

  // Application Settings
  APP: {
    NAME: 'Student Registration System',
    VERSION: '1.0.0',
    DESCRIPTION: 'A comprehensive student registration and course management system'
  },

  // UI Configuration
  UI: {
    ITEMS_PER_PAGE: 10,
    MAX_ITEMS_PER_PAGE: 100,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500
  },

  // File Upload Configuration
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    UPLOAD_DIR: join(__dirname, 'uploads')
  },

  // Validation Rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
    PASSWORD_MIN_LENGTH: 6,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50
  },

  // Features
  FEATURES: {
    DARK_MODE: true,
    NOTIFICATIONS: true,
    ANALYTICS: false,
    OFFLINE_MODE: false,
    AUTO_SAVE: true
  },

  // Development Configuration
  DEV: {
    AUTO_OPEN_BROWSER: true,
    HOT_RELOAD: true,
    SOURCE_MAPS: true
  },

  // Build Configuration
  BUILD: {
    OUTPUT_DIR: 'dist',
    CLEAN_BEFORE_BUILD: true,
    GENERATE_SOURCEMAPS: false
  },

  // Logging Configuration
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    FILE: process.env.LOG_FILE || 'app.log',
    MAX_SIZE: '10m',
    MAX_FILES: 5
  }
};

export default config;