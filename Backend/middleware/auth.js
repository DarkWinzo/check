import jwt from 'jsonwebtoken';
import { User } from '../config/database.js';
import config from '../config/config.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'role', 'is_active', 'locked_until']
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token - user not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    if (user.locked_until && user.locked_until > new Date()) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is temporarily locked',
        code: 'ACCOUNT_LOCKED'
      });
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token format',
        code: 'TOKEN_INVALID'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: userRoles,
        current: req.user.role
      });
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'role', 'is_active']
    });

    req.user = user && user.is_active ? user.toJSON() : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};