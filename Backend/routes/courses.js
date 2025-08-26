import express from 'express';
import { body, validationResult } from 'express-validator';
import { Course, Registration, Student, DATABASE } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', semester = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { status: 'active' };
    
    if (search) {
      whereClause[DATABASE.Sequelize.Op.or] = [
        { course_code: { [DATABASE.Sequelize.Op.like]: `%${search}%` } },
        { course_name: { [DATABASE.Sequelize.Op.like]: `%${search}%` } },
        { instructor: { [DATABASE.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (department) {
      whereClause.department = { [DATABASE.Sequelize.Op.like]: `%${department}%` };
    }
    
    if (semester) {
      whereClause.semester = semester;
    }

    const { count, rows } = await Course.findAndCountAll({
      where: whereClause,
      include: [{
        model: Registration,
        where: { status: 'enrolled' },
        required: false,
        attributes: ['id']
      }],
      order: [['course_code', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Add enrolled count to each course
    const coursesWithCount = await Promise.all(rows.map(async (course) => {
      const enrolledCount = await Registration.count({
        where: { 
          course_id: course.id,
          status: 'enrolled'
        }
      })
      
      return {
        ...course.toJSON(),
        enrolled_count: enrolledCount
      }
    }))

    const totalCount = count
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      courses: coursesWithCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
});

// Get course by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByPk(id, {
      include: [{
        model: Registration,
        where: { status: 'enrolled' },
        required: false,
        attributes: []
      }],
      attributes: [
        '*',
        [DATABASE.fn('COUNT', DATABASE.col('Registrations.id')), 'enrolled_count']
      ],
      group: ['Course.id']
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);

  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error fetching course' });
  }
});

// Create new course (admin only)
router.post('/', authenticateToken, requireRole(['admin']), [
  body('courseCode').trim().isLength({ min: 1 }),
  body('courseName').trim().isLength({ min: 1 }),
  body('duration').optional().trim(),
  body('maxStudents').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      courseCode,
      courseName,
      description,
      duration,
      instructor,
      maxStudents
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({
      where: { course_code: courseCode }
    });

    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = await Course.create({
      course_code: courseCode,
      course_name: courseName,
      description,
      duration,
      instructor,
      max_students: maxStudents
    });

    res.status(201).json({
      message: 'Course created successfully',
      course
    });

  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error creating course' });
  }
});

// Update course (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      courseName,
      description,
      duration,
      instructor,
      maxStudents,
      status
    } = req.body;

    // Check if course exists first
    const existingCourse = await Course.findByPk(id);
    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const updateData = {};

    if (courseName !== undefined) {
      updateData.course_name = courseName;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (duration !== undefined) {
      updateData.duration = duration;
    }
    if (instructor !== undefined) {
      updateData.instructor = instructor;
    }
    if (maxStudents !== undefined) {
      updateData.max_students = maxStudents;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const [updatedRowsCount] = await Course.update(updateData, {
      where: { id },
      returning: true
    });


    const updatedCourse = await Course.findByPk(id);

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ 
      message: 'Server error updating course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get course registrations (admin only)
router.get('/:id/registrations', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const registrations = await Registration.findAll({
      where: { course_id: id },
      include: [{
        model: Student,
        attributes: ['student_id', 'first_name', 'last_name', 'email']
      }],
      order: [['registration_date', 'DESC']]
    });

    res.json(registrations);

  } catch (error) {
    console.error('Error fetching course registrations:', error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// Delete course (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if there are any active registrations
    const activeRegistrations = await Registration.count({
      where: { 
        course_id: id,
        status: 'enrolled'
      }
    });

    if (activeRegistrations > 0) {
      return res.status(400).json({ 
        message: `Cannot delete course. ${activeRegistrations} students are currently enrolled.` 
      });
    }

    // Delete the course
    await Course.destroy({ where: { id } });

    res.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
});

export default router;