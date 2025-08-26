import express from 'express';
import { DATABASE, db, Student, Course, Registration } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateRegistration, validatePagination, validateId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/', authenticateToken, validateRegistration, asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  const student = await Student.findOne({
    where: { user_id: userId }
  });

  if (!student) {
    return res.status(404).json({ 
      success: false,
      message: 'Student profile not found',
      code: 'STUDENT_NOT_FOUND'
    });
  }

  const studentId = student.id;
  const transaction = await db.transaction();

  try {
    const course = await Course.findByPk(courseId, { transaction });

    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }

    if (course.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Course is not available for registration',
        code: 'COURSE_INACTIVE'
      });
    }

    const existingRegistration = await Registration.findOne({
      where: { student_id: studentId, course_id: courseId },
      transaction
    });

    if (existingRegistration) {
      await transaction.rollback();
      return res.status(409).json({ 
        success: false,
        message: 'Already registered for this course',
        code: 'ALREADY_REGISTERED'
      });
    }

    const enrollmentCount = await Registration.count({
      where: { course_id: courseId, status: 'enrolled' },
      transaction
    });

    if (enrollmentCount >= course.max_students) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Course is full',
        code: 'COURSE_FULL'
      });
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

    res.status(201).json({
      success: true,
      message: 'Successfully registered for course',
      registration: completeRegistration
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}));

router.delete('/:id', authenticateToken, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const student = await Student.findOne({
    where: { user_id: userId }
  });

  if (!student) {
    return res.status(404).json({ 
      success: false,
      message: 'Student profile not found',
      code: 'STUDENT_NOT_FOUND'
    });
  }

  const studentId = student.id;
  const whereClause = { id };

  if (req.user.role === 'student') {
    whereClause.student_id = studentId;
  }

  const registration = await Registration.findOne({
    where: whereClause
  });

  if (!registration) {
    return res.status(404).json({ 
      success: false,
      message: 'Registration not found or access denied',
      code: 'REGISTRATION_NOT_FOUND'
    });
  }

  await Registration.update(
    { status: 'dropped' },
    { where: { id } }
  );

  const updatedRegistration = await Registration.findByPk(id);

  res.json({
    success: true,
    message: 'Successfully dropped course',
    registration: updatedRegistration
  });
}));

router.get('/', authenticateToken, requireRole(['admin']), validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = '', courseId = '', studentId = '' } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  
  if (status) whereClause.status = status;
  if (courseId) whereClause.course_id = courseId;
  if (studentId) whereClause.student_id = studentId;

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
    success: true,
    registrations: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

router.put('/:id', authenticateToken, requireRole(['admin']), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, grade, grade_points, notes } = req.body;

  const updateData = {};

  if (status !== undefined) updateData.status = status;
  if (grade !== undefined) updateData.grade = grade;
  if (grade_points !== undefined) updateData.grade_points = grade_points;
  if (notes !== undefined) updateData.notes = notes;

  if (status === 'completed' || status === 'failed') {
    updateData.completion_date = new Date();
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ 
      success: false,
      message: 'No fields to update',
      code: 'NO_UPDATE_FIELDS'
    });
  }

  const [updatedRowsCount] = await Registration.update(updateData, {
    where: { id }
  });

  if (updatedRowsCount === 0) {
    return res.status(404).json({ 
      success: false,
      message: 'Registration not found',
      code: 'REGISTRATION_NOT_FOUND'
    });
  }

  const updatedRegistration = await Registration.findByPk(id);

  res.json({
    success: true,
    message: 'Registration updated successfully',
    registration: updatedRegistration
  });
}));

export default router;