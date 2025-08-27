import express from 'express';
import { body, validationResult } from 'express-validator';
import { DATABASE, Student, Course, Registration } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, [
  body('courseId').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.body;
    const userId = req.user.id;

    const student = await Student.findOne({
      where: { user_id: userId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const studentId = student.id;

    const transaction = await DATABASE.transaction();

    try {
      const course = await Course.findByPk(courseId, { transaction });

      if (!course) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Course not found' });
      }

      if (course.status !== 'active') {
        await transaction.rollback();
        return res.status(400).json({ message: 'Course is not available for registration' });
      }

      const existingRegistration = await Registration.findOne({
        where: { student_id: studentId, course_id: courseId },
        transaction
      });

      if (existingRegistration) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Already registered for this course' });
      }
      const enrollmentCount = await Registration.count({
        where: { course_id: courseId, status: 'enrolled' },
        transaction
      });

      if (enrollmentCount >= course.max_students) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Course is full' });
      }

      const registration = await Registration.create({
        student_id: studentId,
        course_id: courseId,
        status: 'enrolled'
      }, { transaction });

      const completeRegistration = await Registration.findByPk(registration.id, {
        include: [{
          model: Course,
          attributes: ['id', 'course_code', 'course_name', 'instructor', 'duration', 'description']
        }, {
          model: Student,
          attributes: ['id', 'student_id', 'first_name', 'last_name', 'email']
        }],
        transaction
      });
      await transaction.commit();

      console.log('Registration created successfully:', completeRegistration.toJSON());
      res.status(201).json({
        message: 'Successfully registered for course',
        registration: completeRegistration
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error registering for course:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let whereClause = { id };
    
    if (req.user.role === 'student') {
      const student = await Student.findOne({
        where: { user_id: userId }
      });

      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }

      whereClause.student_id = student.id;
    }

    const registration = await Registration.findOne({
      where: whereClause,
      include: [{
        model: Student,
        attributes: ['first_name', 'last_name', 'student_id']
      }, {
        model: Course,
        attributes: ['course_name', 'course_code']
      }]
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found or access denied' });
    }

    if (req.user.role === 'admin') {
      await Registration.destroy({ where: { id } });
      
      res.json({
        message: 'Registration deleted successfully',
        registration: {
          id: registration.id,
          student: registration.Student,
          course: registration.Course,
          status: 'deleted'
        }
      });
    } else {
      await Registration.update(
        { status: 'dropped' },
        { where: { id } }
      );

      const updatedRegistration = await Registration.findByPk(id, {
        include: [{
          model: Student,
          attributes: ['first_name', 'last_name', 'student_id']
        }, {
          model: Course,
          attributes: ['course_name', 'course_code']
        }]
      });

      res.json({
        message: 'Successfully dropped course',
        registration: updatedRegistration
      });
    }

  } catch (error) {
    console.error('Error dropping course:', error);
    res.status(500).json({ message: 'Server error dropping course' });
  }
});

router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', courseId = '', studentId = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (courseId) {
      whereClause.course_id = courseId;
    }
    
    if (studentId) {
      whereClause.student_id = studentId;
    }

    const { count, rows } = await Registration.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ['student_id', 'first_name', 'last_name', 'email']
        },
        {
          model: Course,
          attributes: ['course_code', 'course_name', 'instructor']
        }
      ],
      order: [['registration_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalCount = count;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      registrations: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, grade } = req.body;

    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
    }
    if (grade !== undefined) {
      updateData.grade = grade;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const [updatedRowsCount] = await Registration.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const updatedRegistration = await Registration.findByPk(id);

    res.json({
      message: 'Registration updated successfully',
      registration: updatedRegistration
    });

  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ message: 'Server error updating registration' });
  }
});

export default router;