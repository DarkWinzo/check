// Server-specific configuration
export const serverConfig = {
  // Server Settings
  PORT: 5000,
  HOST: '0.0.0.0',
  
  // Environment
  NODE_ENV: 'development',
  
  // Security
  HELMET_OPTIONS: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // CORS Settings
  CORS: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ]
      
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Body Parser Settings
  BODY_PARSER: {
    json: { limit: '10mb' },
    urlencoded: { extended: true, limit: '10mb' }
  },
  
  // Static Files
  STATIC_FILES: {
    maxAge: '1d',
    etag: true
  }
}

export default serverConfig