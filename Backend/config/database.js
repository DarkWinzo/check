import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import bcrypt from 'bcryptjs';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure database directory exists for SQLite
const dbDir = join(__dirname, "../database/store");
try {
    mkdirSync(dbDir, { recursive: true });
} catch (error) {
    // Directory already exists or other error
}

// Database configuration
const DATABASE_URL = config.DATABASE_URL || "local";
const DATABASE = DATABASE_URL === "local" ?
    new Sequelize({ 
        dialect: 'sqlite', 
        storage: join(dbDir, "local.db"), 
        logging: config.NODE_ENV === 'development' ? console.log : false
    }) :
    new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: { 
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        logging: config.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

// Define Models with clear table structures
export const User = DATABASE.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'student'
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export const Student = DATABASE.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    student_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    enrollment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    }
}, {
    tableName: 'students',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export const Course = DATABASE.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    course_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    credits: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },
    instructor: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    semester: {
        type: DataTypes.STRING,
        allowNull: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    max_students: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    }
}, {
    tableName: 'courses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export const Registration = DATABASE.define('Registration', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    registration_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'enrolled'
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'registrations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Define Associations
User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'SET NULL' });
Student.belongsTo(User, { foreignKey: 'user_id' });

Student.hasMany(Registration, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Registration.belongsTo(Student, { foreignKey: 'student_id' });

Course.hasMany(Registration, { foreignKey: 'course_id', onDelete: 'CASCADE' });
Registration.belongsTo(Course, { foreignKey: 'course_id' });

// Test database connection
export async function testConnection() {
    try {
        await DATABASE.authenticate();
        const dbType = DATABASE_URL === "local" ? "SQLite (local.db)" : "PostgreSQL (cloud)";
        console.log(`✅ Database connection established successfully using ${dbType}`);
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        return false;
    }
}

// Initialize database
export async function initializeDatabase() {
    try {
        // Test connection first
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }
        
        // Sync all models
        await DATABASE.sync({ force: false, alter: false });
        
        const dbType = DATABASE_URL === "local" ? "SQLite (local.db)" : "PostgreSQL (cloud)";
        console.log(`✅ Database synchronized successfully using ${dbType}`);
        
        // Create default admin user
        await createDefaultAdmin();
        
        // Create sample data for better experience
        await createSampleData();
        
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        
        // If sync fails, try without alter
        try {
            console.log('🔄 Retrying database sync without alter...');
            await DATABASE.sync({ force: false });
            console.log('✅ Database synchronized successfully on retry');
            await createDefaultAdmin();
        } catch (retryError) {
            console.error('❌ Database sync failed on retry:', retryError.message);
            throw retryError;
        }
    }
}

// Create default admin user
async function createDefaultAdmin() {
    try {
        // Check if admin user already exists
        const existingAdmin = await User.findOne({
            where: { email: config.ADMIN_EMAIL }
        });

        if (!existingAdmin) {
            // Hash the password
            const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD, 12);
            
            // Create admin user
            await User.create({
                email: config.ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin'
            });

            console.log('✅ Default admin user created successfully!');
            console.log('📧 Admin Email:', config.ADMIN_EMAIL);
            console.log('🔑 Admin Password:', config.ADMIN_PASSWORD);
            console.log('⚠️  Please change the default password after first login!');
            
        } else {
            console.log('ℹ️  Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error creating default admin user:', error.message);
    }
}

// Create sample data for demonstration
async function createSampleData() {
    try {
        // Create sample courses
        const sampleCourses = [
            {
                course_code: 'CS101',
                course_name: 'Introduction to Computer Science',
                description: 'Fundamental concepts of computer science and programming.',
                duration: '1 semester',
                instructor: 'Dr. John Smith',
                department: 'Computer Science',
                semester: 'Fall 2024',
                year: 2024,
                max_students: 30,
                credits: 3
            },
            {
                course_code: 'MATH201',
                course_name: 'Calculus II',
                description: 'Advanced calculus concepts including integration and series.',
                duration: '1 semester',
                instructor: 'Dr. Sarah Johnson',
                department: 'Mathematics',
                semester: 'Fall 2024',
                year: 2024,
                max_students: 25,
                credits: 4
            },
            {
                course_code: 'PHYS101',
                course_name: 'General Physics I',
                description: 'Introduction to mechanics, waves, and thermodynamics.',
                duration: '1 semester',
                instructor: 'Dr. Michael Brown',
                department: 'Physics',
                semester: 'Fall 2024',
                year: 2024,
                max_students: 20,
                credits: 4
            }
        ];

        for (const courseData of sampleCourses) {
            const existingCourse = await Course.findOne({
                where: { course_code: courseData.course_code }
            });
            if (!existingCourse) {
                await Course.create(courseData);
            }
        }

        // Create sample students
        const sampleStudents = [
            {
                student_id: 'STU001',
                first_name: 'Alice',
                last_name: 'Johnson',
                email: 'alice.johnson@student.edu',
                phone: '+1-555-0101',
                date_of_birth: '2000-05-15',
                gender: 'female',
                address: '123 Main St, City, State 12345',
                status: 'active'
            },
            {
                student_id: 'STU002',
                first_name: 'Bob',
                last_name: 'Smith',
                email: 'bob.smith@student.edu',
                phone: '+1-555-0102',
                date_of_birth: '1999-08-22',
                gender: 'male',
                address: '456 Oak Ave, City, State 12345',
                status: 'active'
            },
            {
                student_id: 'STU003',
                first_name: 'Carol',
                last_name: 'Davis',
                email: 'carol.davis@student.edu',
                phone: '+1-555-0103',
                date_of_birth: '2001-02-10',
                gender: 'female',
                address: '789 Pine Rd, City, State 12345',
                status: 'active'
            }
        ];

        for (const studentData of sampleStudents) {
            const existingStudent = await Student.findOne({
                where: { student_id: studentData.student_id }
            });
            if (!existingStudent) {
                await Student.create(studentData);
            }
        }

        console.log('✅ Sample data created successfully!');
    } catch (error) {
        console.error('❌ Error creating sample data:', error.message);
    }
}

// Export database instance
export { DATABASE, DATABASE as db };

// Export query function for compatibility with existing routes
export async function query(sql, params = []) {
    try {
        const [results] = await DATABASE.query(sql, {
            replacements: params,
            type: sql.trim().toUpperCase().startsWith('SELECT') ? 
                DATABASE.QueryTypes.SELECT : 
                DATABASE.QueryTypes.RAW
        });
        return { rows: results };
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🔄 Shutting down gracefully...');
    await DATABASE.close();
    process.exit(0);
});