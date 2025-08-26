import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateStudentCreate = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('studentId')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Student ID must be between 3 and 50 characters'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Must be a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender value'),
  handleValidationErrors
];

export const validateStudentUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Must be a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender value'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'graduated'])
    .withMessage('Invalid status value'),
  handleValidationErrors
];

export const validateCourseCreate = [
  body('courseCode')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Course code must be between 2 and 20 characters'),
  body('courseName')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Course name must be between 3 and 255 characters'),
  body('maxStudents')
    .isInt({ min: 1, max: 500 })
    .withMessage('Max students must be between 1 and 500'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  handleValidationErrors
];

export const validateCourseUpdate = [
  body('courseName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Course name must be between 3 and 255 characters'),
  body('maxStudents')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Max students must be between 1 and 500'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Invalid status value'),
  handleValidationErrors
];

export const validateRegistration = [
  body('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  handleValidationErrors
];