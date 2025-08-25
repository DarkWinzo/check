import dotenv from 'dotenv';
import os from 'os';

// Get network IP
const getNetworkIP = () => {
  const networkInterfaces = os.networkInterfaces();
  
  for (const interfaceName of Object.keys(networkInterfaces)) {
    for (const interface of networkInterfaces[interfaceName]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
};

// Load environment variables
dotenv.config();

const networkIP = getNetworkIP();

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
  
  // Additional allowed origins for CORS
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

  // Database URL (for SQLite)
  DATABASE_URL: process.env.DATABASE_URL || 'local',

  // Default Admin User Configuration
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  ADMIN_FIRST_NAME: process.env.ADMIN_FIRST_NAME || 'System',
  ADMIN_LAST_NAME: process.env.ADMIN_LAST_NAME || 'Administrator'
}

export default config