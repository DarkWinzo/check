import os from 'os';

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

export const config = {
  // Database Configuration
  // Use 'local' for SQLite local.db, or PostgreSQL connection string for cloud database
  DATABASE_URL: 'local', // Change to PostgreSQL URL: 'postgresql://username:password@hostname:port/database'
  
  // JWT Configuration
  JWT_SECRET: 'your_super_secret_jwt_key_here_make_it_long_and_secure_12345',
  JWT_EXPIRES_IN: '7d',

  // Server Configuration
  PORT: 5000,
  NODE_ENV: 'development', // 'development' or 'production'

  // Frontend URL
  CLIENT_URL: 'http://localhost:3000',
  
  // CORS Configuration - Allowed origins
  ALLOWED_ORIGINS: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    `http://${networkIP}:3000`,
    `http://${networkIP}:5173`
  ],

  // Default Admin User Configuration
  ADMIN_EMAIL: 'admin@example.com',
  ADMIN_PASSWORD: 'admin123'
};

export default config;