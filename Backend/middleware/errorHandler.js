import config from '../config/config.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: config.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(error => ({
        field: error.path,
        message: error.message,
        value: error.value
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      field: err.errors[0]?.path,
      code: 'DUPLICATE_ENTRY'
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference to related resource',
      code: 'FOREIGN_KEY_ERROR'
    });
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      message: 'Database operation failed',
      code: 'DATABASE_ERROR'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({
      success: false,
      message: err.message || 'An error occurred',
      code: err.code || 'UNKNOWN_ERROR'
    });
  }

  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};