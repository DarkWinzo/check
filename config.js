// Root Configuration File
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const config = {
  // Project Structure
  ROOT_DIR: __dirname,
  BACKEND_DIR: join(__dirname, 'Backend'),
  FRONTEND_DIR: join(__dirname, 'Frontend'),
  
  // Development Configuration
  DEV: {
    BACKEND_PORT: 5000,
    FRONTEND_PORT: 3000,
    AUTO_OPEN_BROWSER: true,
    HOT_RELOAD: true
  },
  
  // Build Configuration
  BUILD: {
    OUTPUT_DIR: 'dist',
    CLEAN_BEFORE_BUILD: true,
    GENERATE_SOURCEMAPS: false
  },
  
  // Database Configuration
  DATABASE: {
    TYPE: 'sqlite', // 'sqlite' or 'postgres'
    SQLITE_PATH: join(__dirname, 'Backend/database/store/student-registration.db'),
    POSTGRES: {
      HOST: 'localhost',
      PORT: 5432,
      DATABASE: 'student_registration',
      USERNAME: 'postgres',
      PASSWORD: 'your_password'
    }
  },
  
  // Security Configuration
  SECURITY: {
    JWT_SECRET: 'your_super_secret_jwt_key_here_make_it_long_and_secure_12345',
    JWT_EXPIRES_IN: '7d',
    BCRYPT_ROUNDS: 12,
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100
    }
  },
  
  // CORS Configuration
  CORS: {
    ALLOWED_ORIGINS: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    CREDENTIALS: true
  },
  
  // Default Admin User
  DEFAULT_ADMIN: {
    EMAIL: 'admin@example.com',
    PASSWORD: 'admin123',
    FIRST_NAME: 'System',
    LAST_NAME: 'Administrator'
  }
}

export default config