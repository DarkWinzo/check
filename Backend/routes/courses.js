import express from 'express';
import { Course, Registration, Student, DATABASE } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateCourseCreate, validateCourseUpdate, validatePagination, validateId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
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
    success: true,
    courses: coursesWithCount,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

router.get('/:id', authenticateToken, validateId, asyncHandler(async (req, res) => {
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
    return res.status(404).json({ 
      success: false,
      message: 'Course not found',
      code: 'COURSE_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    course
  });
}));

router.post('/', authenticateToken, requireRole(['admin']), validateCourseCreate, asyncHandler(async (req, res) => {
  const {
    courseCode,
    courseName,
    description,
    duration,
    instructor,
    maxStudents,
    credits,
    department,
    semester,
    year
  } = req.body;

  const existingCourse = await Course.findOne({
    where: { course_code: courseCode }
  });

  if (existingCourse) {
    return res.status(409).json({ 
      success: false,
      message: 'Course code already exists',
      code: 'DUPLICATE_COURSE_CODE'
    });
  }

  const course = await Course.create({
    course_code: courseCode,
    course_name: courseName,
    description,
    duration,
    instructor,
    max_students: maxStudents,
    credits,
    department,
    semester,
    year
  });

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    course
  });
}));

router.put('/:id', authenticateToken, requireRole(['admin']), validateId, validateCourseUpdate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    courseName,
    description,
    duration,
    instructor,
    maxStudents,
    status,
    credits,
    department,
    semester,
    year
  } = req.body;

  const existingCourse = await Course.findByPk(id);
  if (!existingCourse) {
    return res.status(404).json({ 
      success: false,
      message: 'Course not found',
      code: 'COURSE_NOT_FOUND'
    });
  }

  const updateData = {};

  if (courseName !== undefined) updateData.course_name = courseName;
  if (description !== undefined) updateData.description = description;
  if (duration !== undefined) updateData.duration = duration;
  if (instructor !== undefined) updateData.instructor = instructor;
  if (maxStudents !== undefined) updateData.max_students = maxStudents;
  if (status !== undefined) updateData.status = status;
  if (credits !== undefined) updateData.credits = credits;
  if (department !== undefined) updateData.department = department;
  if (semester !== undefined) updateData.semester = semester;
  if (year !== undefined) updateData.year = year;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ 
      success: false,
      message: 'No fields to update',
      code: 'NO_UPDATE_FIELDS'
    });
  }

  await Course.update(updateData, {
    where: { id }
  });

  const updatedCourse = await Course.findByPk(id);

  res.json({
    success: true,
    message: 'Course updated successfully',
    course: updatedCourse
  });
}));

router.get('/:id/registrations', authenticateToken, requireRole(['admin']), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registrations = await Registration.findAll({
    where: { course_id: id },
    include: [{
      model: Student,
      attributes: ['student_id', 'first_name', 'last_name', 'email']
    }],
    order: [['registration_date', 'DESC']]
  });

  res.json({
    success: true,
    data: registrations
  });
}));

router.delete('/:id', authenticateToken, requireRole(['admin']), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findByPk(id);

  if (!course) {
    return res.status(404).json({ 
      success: false,
      message: 'Course not found',
      code: 'COURSE_NOT_FOUND'
    });
  }

  const activeRegistrations = await Registration.count({
    where: { 
      course_id: id,
      status: 'enrolled'
    }
  });

  if (activeRegistrations > 0) {
    return res.status(400).json({ 
      success: false,
      message: `Cannot delete course. ${activeRegistrations} students are currently enrolled.`,
      code: 'COURSE_HAS_ENROLLMENTS'
    });
  }

  await Course.destroy({ where: { id } });

  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
}));

export default router;