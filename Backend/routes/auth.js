import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateLogin } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import config from '../config/config.js';

const router = express.Router();

router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
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
      message: 'Account is temporarily locked due to too many failed login attempts',
      code: 'ACCOUNT_LOCKED',
      locked_until: user.locked_until
    });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    const loginAttempts = user.login_attempts + 1;
    const updateData = { login_attempts: loginAttempts };

    if (loginAttempts >= config.MAX_LOGIN_ATTEMPTS) {
      updateData.locked_until = new Date(Date.now() + config.LOCK_TIME);
    }

    await User.update(updateData, { where: { id: user.id } });

    return res.status(401).json({ 
      success: false,
      message: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
      attempts_remaining: Math.max(0, config.MAX_LOGIN_ATTEMPTS - loginAttempts)
    });
  }

  await User.update({
    login_attempts: 0,
    locked_until: null,
    last_login: new Date()
  }, { where: { id: user.id } });

  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }
  });
}));

router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
}));

router.get('/verify', authenticateToken, asyncHandler(async (req, res) => {
  res.json({ 
    success: true,
    valid: true, 
    user: req.user 
  });
}));

export default router;