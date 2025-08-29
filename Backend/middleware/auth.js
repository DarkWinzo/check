import jwt from 'jsonwebtoken';
import { User } from '../config/database.js';
import config from '../config/config.js';

export const authenticateToken = async (req, res, next) => {
  let user = null;
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'role']
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Add retry logic for database queries
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !user) {
      try {
        user = await User.findByPk(decoded.userId, {
          attributes: ['id', 'email', 'role']
        });
        break;
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }
          console.log(`Database query retry ${retryCount}/${maxRetries} for user authentication`);
    req.user = user.toJSON();
    next();
    
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token format' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    } else if (error.message.includes('database') || error.message.includes('connection')) {
      return res.status(503).json({ message: 'Service temporarily unavailable' });
    } else {
      return res.status(403).json({ message: 'Authentication failed' });
      }
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!Array.isArray(roles)) {
        roles = [roles];
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: roles,
          current: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error.message);
      return res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

// Enhanced middleware for API key validation (if needed)
export const validateApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ message: 'API key required' });
    }
    
    // Add your API key validation logic here
    // For now, just pass through
    next();
  } catch (error) {
    console.error('API key validation error:', error.message);
    return res.status(500).json({ message: 'API key validation failed' });
  }
};

// Rate limiting per user
export const createUserRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const userRequests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }
    
    const requests = userRequests.get(userId);
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= max) {
      return res.status(429).json({ 
        message: 'Too many requests from this user',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validRequests.push(now);
    userRequests.set(userId, validRequests);
    
    next();
  };
};