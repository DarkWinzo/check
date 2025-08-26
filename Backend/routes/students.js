import express from 'express';
import { Student, User, Registration, Course, DATABASE, db } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateStudentCreate, validateStudentUpdate, validatePagination, validateId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['admin']), validateStudentCreate, asyncHandler(async (req, res) => {
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

  const transaction = await db.transaction();

  try {
    const existingStudent = await Student.findOne({
      where: { student_id: studentId },
      transaction
    });

    if (existingStudent) {
      await transaction.rollback();
      return res.status(409).json({ 
        success: false,
        message: 'Student ID already exists',
        code: 'DUPLICATE_STUDENT_ID'
      });
    }

    const existingEmail = await Student.findOne({
      where: { email },
      transaction
    });

    if (existingEmail) {
      await transaction.rollback();
      return res.status(409).json({ 
        success: false,
        message: 'Email already exists',
        code: 'DUPLICATE_EMAIL'
      });
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
    }, { transaction });

    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}));

router.get('/', authenticateToken, requireRole(['admin']), validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', course = '' } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  
  if (search) {
    whereClause[db.Sequelize.Op.or] = [
      { first_name: { [db.Sequelize.Op.like]: `%${search}%` } },
      { last_name: { [db.Sequelize.Op.like]: `%${search}%` } },
      { student_id: { [db.Sequelize.Op.like]: `%${search}%` } },
      { email: { [db.Sequelize.Op.like]: `%${search}%` } }
    ];
  }

  let includeOptions = [];
  
  if (course) {
    includeOptions.push({
      model: Registration,
      include: [{
        model: Course,
        where: {
          [db.Sequelize.Op.or]: [
            { course_name: { [db.Sequelize.Op.like]: `%${course}%` } },
            { course_code: { [db.Sequelize.Op.like]: `%${course}%` } }
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
    success: true,
    students: rows,
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
  
  if (id === 'me' && req.user.role === 'student') {
    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: User,
        attributes: ['email', 'role']
      }]
    });

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student profile not found',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      student
    });
  }

  let whereClause = {}
  
  if (!isNaN(id)) {
    whereClause = { id: parseInt(id) };
  } else {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid student ID',
      code: 'INVALID_ID'
    });
  }
  
  if (req.user.role === 'student') {
    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: User,
        attributes: ['email', 'role']
      }]
    });

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student profile not found',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    if (parseInt(id) !== student.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
  }

  const student = await Student.findOne({
    where: whereClause,
    include: [{
      model: User,
      attributes: ['email', 'role']
    }]
  });

  if (!student) {
    return res.status(404).json({ 
      success: false,
      message: 'Student not found',
      code: 'STUDENT_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    student
  });
}));

router.put('/:id', authenticateToken, validateId, validateStudentUpdate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, dateOfBirth, address, gender, status } = req.body;

  if (req.user.role === 'student') {
    const student = await Student.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!student) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
  }

  const updateData = {};

  if (firstName !== undefined) updateData.first_name = firstName;
  if (lastName !== undefined) updateData.last_name = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
  if (address !== undefined) updateData.address = address;
  if (gender !== undefined) updateData.gender = gender;
  if (status !== undefined && req.user.role === 'admin') updateData.status = status;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ 
      success: false,
      message: 'No fields to update',
      code: 'NO_UPDATE_FIELDS'
    });
  }

  const [updatedRowsCount] = await Student.update(updateData, {
    where: { id }
  });

  if (updatedRowsCount === 0) {
    return res.status(404).json({ 
      success: false,
      message: 'Student not found',
      code: 'STUDENT_NOT_FOUND'
    });
  }

  const updatedStudent = await Student.findByPk(id);

  res.json({
    success: true,
    message: 'Student updated successfully',
    student: updatedStudent
  });
}));

router.get('/:id/registrations', authenticateToken, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  let studentId;
  
  if (id === 'me' && req.user.role === 'student') {
    const student = await Student.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student profile not found',
        code: 'STUDENT_NOT_FOUND'
      });
    }
    studentId = student.id;
  } else if (req.user.role === 'student') {
    const student = await Student.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!student || student.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    studentId = student.id;
  } else {
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found',
        code: 'STUDENT_NOT_FOUND'
      });
    }
    studentId = id;
  }

  const registrations = await Registration.findAll({
    where: { student_id: studentId },
    include: [{
      model: Course,
      attributes: ['id', 'course_code', 'course_name', 'instructor', 'department', 'description', 'duration']
    }],
    order: [['registration_date', 'DESC']]
  });

  res.json({
    success: true,
    data: registrations || [],
    count: registrations ? registrations.length : 0
  });
}));

router.post('/:id/enroll', authenticateToken, requireRole(['admin']), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { courseIds } = req.body;

  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Course IDs array is required',
      code: 'INVALID_COURSE_IDS'
    });
  }

  const student = await Student.findByPk(id);
  if (!student) {
    return res.status(404).json({ 
      success: false,
      message: 'Student not found',
      code: 'STUDENT_NOT_FOUND'
    });
  }

  const transaction = await DATABASE.transaction();
  const results = [];
  const errors = [];

  try {
    for (const courseId of courseIds) {
      try {
        const course = await Course.findByPk(courseId, { transaction });
        if (!course) {
          errors.push(`Course with ID ${courseId} not found`);
          continue;
        }

        if (course.status !== 'active') {
          errors.push(`Course ${course.course_name} is not available for registration`);
          continue;
        }

        const existingRegistration = await Registration.findOne({
          where: { student_id: id, course_id: courseId },
          transaction
        });

        if (existingRegistration) {
          errors.push(`Already registered for ${course.course_name}`);
          continue;
        }

        const enrollmentCount = await Registration.count({
          where: { course_id: courseId, status: 'enrolled' },
          transaction
        });

        if (enrollmentCount >= course.max_students) {
          errors.push(`Course ${course.course_name} is full`);
          continue;
        }

        const registration = await Registration.create({
          student_id: id,
          course_id: courseId,
          status: 'enrolled'
        }, { transaction });

        results.push({
          courseId,
          courseName: course.course_name,
          registrationId: registration.id
        });
      } catch (error) {
        errors.push(`Error enrolling in course ${courseId}: ${error.message}`);
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Enrollment process completed',
      successful: results,
      errors: errors,
      successCount: results.length,
      errorCount: errors.length
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}));

router.post('/:id/unenroll', authenticateToken, requireRole(['admin']), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { registrationIds } = req.body;

  if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Registration IDs array is required',
      code: 'INVALID_REGISTRATION_IDS'
    });
  }

  const student = await Student.findByPk(id);
  if (!student) {
    return res.status(404).json({ 
      success: false,
      message: 'Student not found',
      code: 'STUDENT_NOT_FOUND'
    });
  }

  const results = [];
  const errors = [];

  for (const registrationId of registrationIds) {
    try {
      const registration = await Registration.findOne({
        where: { id: registrationId, student_id: id }
      });

      if (!registration) {
        errors.push(`Registration ${registrationId} not found`);
        continue;
      }

      await Registration.update(
        { status: 'dropped' },
        { where: { id: registrationId } }
      );

      results.push(registrationId);
    } catch (error) {
      errors.push(`Error dropping registration ${registrationId}: ${error.message}`);
    }
  }

  res.json({
    success: true,
    message: 'Unenrollment process completed',
    successful: results,
    errors: errors,
    successCount: results.length,
    errorCount: errors.length
  });
}));

router.delete('/:id', authenticateToken, requireRole(['admin']), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findByPk(id);

  if (!student) {
    return res.status(404).json({ 
      success: false,
      message: 'Student not found',
      code: 'STUDENT_NOT_FOUND'
    });
  }

  await Student.destroy({ where: { id } });

  res.json({
    success: true,
    message: 'Student deleted successfully'
  });
}));

export default router;