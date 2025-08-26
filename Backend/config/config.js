import os from 'os';

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
  DATABASE_URL: process.env.DATABASE_URL || 'local',
  
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_long_and_secure_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  PORT: parseInt(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  ALLOWED_ORIGINS: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    `http://${networkIP}:3000`,
    `http://${networkIP}:5173`
  ],

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  LOCK_TIME: parseInt(process.env.LOCK_TIME) || 2 * 60 * 60 * 1000,

  SESSION_SECRET: process.env.SESSION_SECRET || 'your_session_secret_key_here',
  
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true' || true,
  
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024,
  
  CACHE_TTL: parseInt(process.env.CACHE_TTL) || 300
};

export default config;