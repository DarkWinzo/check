import dotenv from 'dotenv';
import os from 'os';
dotenv.config();

// F### network IP
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

export const config = {
  // Database ConfiG
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'student_registration',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:Isuru%402025@localhost:5432/testdb',

  // JWT Config
  JWT_SECRET: process.env.JWT_SECRET || '52deb4fa35a370a27d31ca22eccb0254c253186bd66a73928b5d8ef14d34a04b',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Server Config
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Frontend URL
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // CORS Config
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

  // ADMIN CONFIG
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  ADMIN_FIRST_NAME: process.env.ADMIN_FIRST_NAME || 'System',
  ADMIN_LAST_NAME: process.env.ADMIN_LAST_NAME || 'Administrator'
};

export default config;