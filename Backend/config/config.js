import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Database Configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'student_registration',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'your_password',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_long_and_secure_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Frontend URL
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Database URL (for SQLite)
  DATABASE_URL: process.env.DATABASE_URL || 'local',

  // Default Admin User Configuration
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  ADMIN_FIRST_NAME: process.env.ADMIN_FIRST_NAME || 'System',
  ADMIN_LAST_NAME: process.env.ADMIN_LAST_NAME || 'Administrator'
}

export default config