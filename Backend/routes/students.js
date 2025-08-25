import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { Student, User, Registration, Course, DATABASE } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Create new student (admin only)
router.post('/', authenticateToken, requireRole(['admin']), [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('studentId').trim().isLength({ min: 1 }).withMessage('Student ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      studentId,
      phone,
      dateOfBirth,
      address,
      status = 'active',
      gender
    } = req.body;

    // Check if student ID already exists
    const existingStudent = await Student.findOne({
      where: { student_id: studentId }
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    // Check if email already exists
    const existingEmail = await Student.findOne({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const student = await Student.create({
      student_id: studentId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      date_of_birth: dateOfBirth,
      gender,
      address,
      status
    });

    res.status(201).json({
      message: 'Student created successfully',
      student
    });

  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error creating student' });
  }
});

// Get all students (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', course = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause[DATABASE.Sequelize.Op.or] = [
        { first_name: { [DATABASE.Sequelize.Op.like]: `%${search}%` } },
        { last_name: { [DATABASE.Sequelize.Op.like]: `%${search}%` } },
        { student_id: { [DATABASE.Sequelize.Op.like]: `%${search}%` } },
        { email: { [DATABASE.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    let includeOptions = [];
    
    if (course) {
      includeOptions.push({
        model: Registration,
        include: [{
          model: Course,
          where: {
            [DATABASE.Sequelize.Op.or]: [
              { course_name: { [DATABASE.Sequelize.Op.like]: `%${course}%` } },
              { course_code: { [DATABASE.Sequelize.Op.like]: `%${course}%` } }
            ]
          }
        }],
        required: true
      });
    }
    
    const { count, rows } = await Student.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalCount = count;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      students: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      message: 'Server error fetching students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereClause = {}
    
    // Students can only view their own profile, admins can view any
    if (req.user.role === 'student' || id === 'me') {
      // For students, find their student record by user_id
      const student = await Student.findOne({
        where: { user_id: req.user.id },
        include: [{
          model: User,
          attributes: ['email', 'role']
        }]
      })

      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' })
      }

      return res.json(student)
    }

    // Handle numeric ID for admin access
    whereClause = { id: parseInt(id) }
    
    // For admins, get any student by ID
    const student = await Student.findOne({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['email', 'role']
      }]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or access denied' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error fetching student' });
  }
});

// Update student profile
router.put('/:id', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().trim(),
  body('gender').optional().trim(),
  body('address').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { firstName, lastName, phone, dateOfBirth, address, gender, status } = req.body;

    // Students can only update their own profile
    if (req.user.role === 'student') {
      const student = await Student.findOne({
        where: { id, user_id: req.user.id }
      });

      if (!student) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const updateData = {};

    if (firstName !== undefined) {
      updateData.first_name = firstName;
    }
    if (lastName !== undefined) {
      updateData.last_name = lastName;
    }
    if (phone !== undefined) {
      updateData.phone = phone;
    }
    if (dateOfBirth !== undefined) {
      updateData.date_of_birth = dateOfBirth;
    }
    if (address !== undefined) {
      updateData.address = address;
    }
    if (gender !== undefined) {
      updateData.gender = gender;
    }
    if (status !== undefined && req.user.role === 'admin') {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const [updatedRowsCount] = await Student.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const updatedStudent = await Student.findByPk(id);

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error updating student' });
  }
});

// Get student's registrations
router.get('/:id/registrations', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // For students, get their own registrations by user_id
    let studentId = id;
    if (req.user.role === 'student') {
      const student = await Student.findOne({
        where: { user_id: req.user.id }
      });
      
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      studentId = student.id;
    } else {
      // For admins, verify the student exists
      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
    }

    const registrations = await Registration.findAll({
      where: { student_id: studentId },
      include: [{
        model: Course,
        attributes: ['id', 'course_code', 'course_name', 'instructor', 'department', 'description', 'duration']
      }],
      order: [['registration_date', 'DESC']]
    });

    console.log(`Found ${registrations ? registrations.length : 0} registrations for student ${studentId}`);
    
    // Always return success with data array
    res.json({
      success: true,
      data: registrations || [],
      count: registrations ? registrations.length : 0
    });

  } catch (error) {
    console.error('Error fetching student registrations:', error);
    // Return success with empty array for better UX
    res.json({ 
      success: true,
      message: 'No registrations found', 
      data: [],
      count: 0
    });
  }
});

// Delete student (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete the student (this will cascade delete registrations due to foreign key constraints)
    await Student.destroy({ where: { id } });

    res.json({
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error deleting student' });
  }
});

export default router;
