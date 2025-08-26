import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import config from './config/config.js';

import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import courseRoutes from './routes/courses.js';
import registrationRoutes from './routes/registrations.js';

import { initializeDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = config.PORT;

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (config.ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      if (config.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: config.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return config.NODE_ENV === 'development' && req.ip === '127.0.0.1';
  }
});

app.use(limiter);

if (config.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/registrations', registrationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Student Registration System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      courses: '/api/courses',
      registrations: '/api/registrations',
      health: '/api/health'
    }
  });
});

app.use('/api/*', notFoundHandler);
app.use('*', notFoundHandler);

app.use(errorHandler);

async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`🔒 CORS Origins: ${config.ALLOWED_ORIGINS.join(', ')}`);
    });

    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    const gracefulShutdown = (signal) => {
      console.log(`\n🔄 Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();