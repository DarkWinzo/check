import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import bcrypt from 'bcryptjs';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure database directory exists
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
        storage: join(dbDir, "student-registration.db"), 
        logging: false 
    }) :
    new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        ssl: true,
        protocol: 'postgres',
        dialectOptions: { 
            native: true, 
            ssl: { require: true, rejectUnauthorized: false } 
        },
        logging: false
    });

// Define Models
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
        references: {
            model: User,
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
    phone: DataTypes.STRING,
    date_of_birth: DataTypes.DATE,
    gender: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: DataTypes.TEXT,
    enrollment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    }
}, {
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
    description: DataTypes.TEXT,
    duration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    credits: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },
    instructor: DataTypes.STRING,
    department: DataTypes.STRING,
    semester: DataTypes.STRING,
    year: DataTypes.INTEGER,
    max_students: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    }
}, {
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
        references: {
            model: Student,
            key: 'id'
        }
    },
    course_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Course,
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
    grade: DataTypes.STRING
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Define Associations
User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'user_id' });

Student.hasMany(Registration, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Registration.belongsTo(Student, { foreignKey: 'student_id' });

Course.hasMany(Registration, { foreignKey: 'course_id', onDelete: 'CASCADE' });
Registration.belongsTo(Course, { foreignKey: 'course_id' });

// Test database connection
export async function testConnection() {
    try {
        await DATABASE.authenticate();
        console.log('Database connection established successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
}

// Initialize database
export async function initializeDatabase() {
    try {
        // Sync all models
        await DATABASE.sync({ force: false, alter: true });
        
        console.log('Database synchronized successfully');
        
        // Create default admin user if it doesn't exist
        await createDefaultAdmin();
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
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
            const adminUser = await User.create({
                email: config.ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin'
            });

            // Create admin student profile
            await Student.create({
                user_id: adminUser.id,
                student_id: 'ADMIN001',
                first_name: config.ADMIN_FIRST_NAME,
                last_name: config.ADMIN_LAST_NAME,
                email: config.ADMIN_EMAIL,
                status: 'active'
            });

            console.log('✅ Default admin user created successfully!');
            console.log('📧 Admin Email:', config.ADMIN_EMAIL);
            console.log('🔑 Admin Password:', config.ADMIN_PASSWORD);
            console.log('⚠️  Please change the default password after first login!');
        } else {
            console.log('ℹ️  Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error creating default admin user:', error);
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
        console.error('Database query error:', error);
        throw error;
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await DATABASE.close();
    process.exit(0);
});
