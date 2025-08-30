import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import config from './config/config.js';

import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import courseRoutes from './routes/courses.js';
import registrationRoutes from './routes/registrations.js';
import { initializeDatabase } from './config/database.js';

const app = express();
const PORT = config.PORT || 5000;

// Create HTTP server for better connection handling
const server = createServer(app);

// Enhanced server configuration
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (config.ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint with detailed status
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  }
  
  res.status(200).json(healthStatus);
});

// Connection monitoring middleware
app.use((req, res, next) => {
  // Set connection headers for better client handling
  res.set({
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=65'
  });
  
  // Add request timeout
  req.setTimeout(30000, () => {
    res.status(408).json({ message: 'Request timeout' });
  });
  
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/registrations', registrationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Enhanced error response
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    });
    
    // Graceful shutdown handling
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

startServer();