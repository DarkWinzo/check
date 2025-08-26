import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import bcrypt from 'bcryptjs';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbDir = join(__dirname, "../database/store");
try {
    mkdirSync(dbDir, { recursive: true });
} catch (error) {
    if (error.code !== 'EEXIST') {
        console.error('Database directory creation failed:', error.message);
    }
}

const DATABASE_URL = config.DATABASE_URL;

let DATABASE;

if (DATABASE_URL === "local") {
    DATABASE = new Sequelize({ 
        dialect: 'sqlite', 
        storage: join(dbDir, "local.db"), 
        logging: config.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 1,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        dialectOptions: {
            busyTimeout: 30000
        }
    });
} else {
    DATABASE = new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: { 
            ssl: config.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false,
            connectTimeout: 60000,
            socketTimeout: 60000
        },
        logging: config.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 25,
            min: 5,
            acquire: 60000,
            idle: 10000,
            evict: 1000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        retry: {
            max: 3
        }
    });
}

// Test database connection before defining models
const testConnection = async () => {
    try {
        await DATABASE.authenticate();
        const dbType = DATABASE_URL === "local" ? "SQLite (local.db)" : "PostgreSQL (cloud)";
        console.log(`✅ Database connection established successfully using ${dbType}`);
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        return false;
    }
};

// Define models only after successful connection
const defineModels = () => {
    const User = DATABASE.define('users', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(255),
            unique: {
                name: 'unique_user_email',
                msg: 'Email address already exists'
            },
            allowNull: false,
            validate: {
                isEmail: {
                    msg: 'Must be a valid email address'
                },
                len: {
                    args: [5, 255],
                    msg: 'Email must be between 5 and 255 characters'
                }
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: {
                    args: [6, 255],
                    msg: 'Password must be at least 6 characters'
                }
            }
        },
        role: {
            type: DataTypes.ENUM('admin', 'student', 'instructor'),
            defaultValue: 'student',
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        login_attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        locked_until: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        indexes: [
            { fields: ['email'] },
            { fields: ['role'] },
            { fields: ['is_active'] }
        ],
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 12);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 12);
                }
            }
        }
    });

    const Student = DATABASE.define('students', {
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
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        student_id: {
            type: DataTypes.STRING(50),
            unique: {
                name: 'unique_student_id',
                msg: 'Student ID already exists'
            },
            allowNull: false,
            validate: {
                len: {
                    args: [3, 50],
                    msg: 'Student ID must be between 3 and 50 characters'
                }
            }
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 100],
                    msg: 'First name must be between 1 and 100 characters'
                }
            }
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 100],
                    msg: 'Last name must be between 1 and 100 characters'
                }
            }
        },
        email: {
            type: DataTypes.STRING(255),
            unique: {
                name: 'unique_student_email',
                msg: 'Email address already exists'
            },
            allowNull: false,
            validate: {
                isEmail: {
                    msg: 'Must be a valid email address'
                }
            }
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 20],
                    msg: 'Phone number cannot exceed 20 characters'
                }
            }
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            validate: {
                isDate: {
                    msg: 'Must be a valid date'
                },
                isBefore: {
                    args: new Date().toISOString().split('T')[0],
                    msg: 'Date of birth cannot be in the future'
                }
            }
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
            allowNull: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        enrollment_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended', 'graduated'),
            defaultValue: 'active',
            allowNull: false
        },
        gpa: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            validate: {
                min: 0.00,
                max: 4.00
            }
        }
    }, {
        indexes: [
            { fields: ['student_id'] },
            { fields: ['email'] },
            { fields: ['status'] },
            { fields: ['enrollment_date'] },
            { fields: ['first_name', 'last_name'] }
        ]
    });

    const Course = DATABASE.define('courses', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        course_code: {
            type: DataTypes.STRING(20),
            unique: {
                name: 'unique_course_code',
                msg: 'Course code already exists'
            },
            allowNull: false,
            validate: {
                len: {
                    args: [2, 20],
                    msg: 'Course code must be between 2 and 20 characters'
                }
            }
        },
        course_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: {
                    args: [3, 255],
                    msg: 'Course name must be between 3 and 255 characters'
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        duration: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        credits: {
            type: DataTypes.INTEGER,
            defaultValue: 3,
            validate: {
                min: 1,
                max: 10
            }
        },
        instructor: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        department: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        semester: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 2020,
                max: 2030
            }
        },
        max_students: {
            type: DataTypes.INTEGER,
            defaultValue: 30,
            validate: {
                min: 1,
                max: 500
            }
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'archived'),
            defaultValue: 'active',
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        prerequisites: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        indexes: [
            { fields: ['course_code'] },
            { fields: ['status'] },
            { fields: ['department'] },
            { fields: ['semester', 'year'] },
            { fields: ['instructor'] }
        ],
        validate: {
            endDateAfterStartDate() {
                if (this.start_date && this.end_date && this.start_date >= this.end_date) {
                    throw new Error('End date must be after start date');
                }
            }
        }
    });

    const Registration = DATABASE.define('registrations', {
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
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'courses',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        registration_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('enrolled', 'completed', 'dropped', 'failed', 'withdrawn'),
            defaultValue: 'enrolled',
            allowNull: false
        },
        grade: {
            type: DataTypes.STRING(5),
            allowNull: true,
            validate: {
                isIn: {
                    args: [['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W', 'P', 'NP']],
                    msg: 'Invalid grade format'
                }
            }
        },
        grade_points: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            validate: {
                min: 0.00,
                max: 4.00
            }
        },
        completion_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        indexes: [
            { fields: ['student_id'] },
            { fields: ['course_id'] },
            { fields: ['status'] },
            { fields: ['registration_date'] },
            { fields: ['student_id', 'course_id'], unique: true, name: 'unique_student_course' }
        ]
    });

    // Define associations
    User.hasOne(Student, { 
        foreignKey: 'user_id', 
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });
    Student.belongsTo(User, { 
        foreignKey: 'user_id' 
    });

    Student.hasMany(Registration, { 
        foreignKey: 'student_id', 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Registration.belongsTo(Student, { 
        foreignKey: 'student_id' 
    });

    Course.hasMany(Registration, { 
        foreignKey: 'course_id', 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Registration.belongsTo(Course, { 
        foreignKey: 'course_id' 
    });

    return { User, Student, Course, Registration };
};

// Initialize models
let User, Student, Course, Registration;

const initializeModels = async () => {
    const connected = await testConnection();
    if (!connected) {
        throw new Error('Database connection failed');
    }
    
    const models = defineModels();
    User = models.User;
    Student = models.Student;
    Course = models.Course;
    Registration = models.Registration;
    
    return models;
};

const initializeDatabase = async () => {
    try {
        await initializeModels();
        
        await DATABASE.sync({ 
            force: false, 
            alter: config.NODE_ENV === 'development' 
        });
        
        const dbType = DATABASE_URL === "local" ? "SQLite (local.db)" : "PostgreSQL (cloud)";
        console.log(`✅ Database synchronized successfully using ${dbType}`);
        
        await createDefaultAdmin();
        
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        
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
};

const createDefaultAdmin = async () => {
    try {
        if (!User) {
            console.error('❌ User model not initialized');
            return;
        }

        const existingAdmin = await User.findOne({
            where: { email: config.ADMIN_EMAIL }
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD, 12);
            
            await User.create({
                email: config.ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin',
                is_active: true
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
};

// Export models and functions
export { DATABASE, DATABASE as db, User, Student, Course, Registration, testConnection, initializeDatabase };

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

process.on('SIGINT', async () => {
    console.log('🔄 Shutting down gracefully...');
    await DATABASE.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down gracefully...');
    await DATABASE.close();
    process.exit(0);
});
    new Sequelize({ 
        dialect: 'sqlite', 
        storage: join(dbDir, "local.db"), 
        logging: config.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        dialectOptions: {
            busyTimeout: 30000
        }
    }) :
    new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: { 
            ssl: config.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false,
            connectTimeout: 60000,
            socketTimeout: 60000
        },
        logging: config.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 25,
            min: 5,
            acquire: 60000,
            idle: 10000,
            evict: 1000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        retry: {
            max: 3
        }
    });

export const User = DATABASE.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        unique: {
            name: 'unique_user_email',
            msg: 'Email address already exists'
        },
        allowNull: false,
        validate: {
            isEmail: {
                msg: 'Must be a valid email address'
            },
            len: {
                args: [5, 255],
                msg: 'Email must be between 5 and 255 characters'
            }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: {
                args: [6, 255],
                msg: 'Password must be at least 6 characters'
            }
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'student', 'instructor'),
        defaultValue: 'student',
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    login_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    locked_until: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    indexes: [
        { fields: ['email'] },
        { fields: ['role'] },
        { fields: ['is_active'] }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        }
    }
});

export const Student = DATABASE.define('students', {
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
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    student_id: {
        type: DataTypes.STRING(50),
        unique: {
            name: 'unique_student_id',
            msg: 'Student ID already exists'
        },
        allowNull: false,
        validate: {
            len: {
                args: [3, 50],
                msg: 'Student ID must be between 3 and 50 characters'
            }
        }
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: {
                args: [1, 100],
                msg: 'First name must be between 1 and 100 characters'
            }
        }
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: {
                args: [1, 100],
                msg: 'Last name must be between 1 and 100 characters'
            }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        unique: {
            name: 'unique_student_email',
            msg: 'Email address already exists'
        },
        allowNull: false,
        validate: {
            isEmail: {
                msg: 'Must be a valid email address'
            }
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            len: {
                args: [0, 20],
                msg: 'Phone number cannot exceed 20 characters'
            }
        }
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'Must be a valid date'
            },
            isBefore: {
                args: new Date().toISOString().split('T')[0],
                msg: 'Date of birth cannot be in the future'
            }
        }
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    enrollment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'graduated'),
        defaultValue: 'active',
        allowNull: false
    },
    gpa: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: 0.00,
            max: 4.00
        }
    }
}, {
    indexes: [
        { fields: ['student_id'] },
        { fields: ['email'] },
        { fields: ['status'] },
        { fields: ['enrollment_date'] },
        { fields: ['first_name', 'last_name'] }
    ]
});

export const Course = DATABASE.define('courses', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_code: {
        type: DataTypes.STRING(20),
        unique: {
            name: 'unique_course_code',
            msg: 'Course code already exists'
        },
        allowNull: false,
        validate: {
            len: {
                args: [2, 20],
                msg: 'Course code must be between 2 and 20 characters'
            }
        }
    },
    course_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: {
                args: [3, 255],
                msg: 'Course name must be between 3 and 255 characters'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duration: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    credits: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        validate: {
            min: 1,
            max: 10
        }
    },
    instructor: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    semester: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 2020,
            max: 2030
        }
    },
    max_students: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
        validate: {
            min: 1,
            max: 500
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'archived'),
        defaultValue: 'active',
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    prerequisites: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    indexes: [
        { fields: ['course_code'] },
        { fields: ['status'] },
        { fields: ['department'] },
        { fields: ['semester', 'year'] },
        { fields: ['instructor'] }
    ],
    validate: {
        endDateAfterStartDate() {
            if (this.start_date && this.end_date && this.start_date >= this.end_date) {
                throw new Error('End date must be after start date');
            }
        }
    }
});

export const Registration = DATABASE.define('registrations', {
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
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    registration_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('enrolled', 'completed', 'dropped', 'failed', 'withdrawn'),
        defaultValue: 'enrolled',
        allowNull: false
    },
    grade: {
        type: DataTypes.STRING(5),
        allowNull: true,
        validate: {
            isIn: {
                args: [['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W', 'P', 'NP']],
                msg: 'Invalid grade format'
            }
        }
    },
    grade_points: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: 0.00,
            max: 4.00
        }
    },
    completion_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    indexes: [
        { fields: ['student_id'] },
        { fields: ['course_id'] },
        { fields: ['status'] },
        { fields: ['registration_date'] },
        { fields: ['student_id', 'course_id'], unique: true, name: 'unique_student_course' }
    ]
});

User.hasOne(Student, { 
    foreignKey: 'user_id', 
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
Student.belongsTo(User, { 
    foreignKey: 'user_id' 
});

Student.hasMany(Registration, { 
    foreignKey: 'student_id', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Registration.belongsTo(Student, { 
    foreignKey: 'student_id' 
});

Course.hasMany(Registration, { 
    foreignKey: 'course_id', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Registration.belongsTo(Course, { 
    foreignKey: 'course_id' 
});

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

export async function initializeDatabase() {
    try {
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }
        
        await DATABASE.sync({ 
            force: false, 
            alter: config.NODE_ENV === 'development' 
        });
        
        const dbType = DATABASE_URL === "local" ? "SQLite (local.db)" : "PostgreSQL (cloud)";
        console.log(`✅ Database synchronized successfully using ${dbType}`);
        
        await createDefaultAdmin();
        
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        
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

async function createDefaultAdmin() {
    try {
        const existingAdmin = await User.findOne({
            where: { email: config.ADMIN_EMAIL }
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD, 12);
            
            await User.create({
                email: config.ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin',
                is_active: true
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

export { DATABASE, DATABASE as db };

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

process.on('SIGINT', async () => {
    console.log('🔄 Shutting down gracefully...');
    await DATABASE.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down gracefully...');
    await DATABASE.close();
    process.exit(0);
});