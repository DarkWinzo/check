import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import bcrypt from 'bcryptjs';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbDir = join(__dirname, "../database/database.js");
try {
    mkdirSync(dbDir, { recursive: true });
} catch (error) {
    console.log('Database directory already exists or created successfully');
}

const DATABASE_URL = config.DATABASE_URL || "local";

// Enhanced database configuration
const DATABASE = DATABASE_URL === "local" ?
    new Sequelize({ 
        dialect: 'sqlite', 
        storage: join(dbDir, "student-registration.db"), 
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        retry: {
            match: [
                /SQLITE_BUSY/,
            ],
            max: 3
        }
    }) :
    new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        ssl: process.env.NODE_ENV === 'production',
        protocol: 'postgres',
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        retry: {
            match: [
                /ConnectionError/,
                /ConnectionRefusedError/,
                /ConnectionTimedOutError/,
                /TimeoutError/,
            ],
            max: 3
        }
    });

// Connection event handlers
DATABASE.addHook('beforeConnect', () => {
    console.log('🔌 Attempting database connection...');
});

DATABASE.addHook('afterConnect', () => {
    console.log('✅ Database connected successfully');
});

DATABASE.addHook('beforeDisconnect', () => {
    console.log('🔌 Disconnecting from database...');
});

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

User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'user_id' });

Student.hasMany(Registration, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Registration.belongsTo(Student, { foreignKey: 'student_id' });

Course.hasMany(Registration, { foreignKey: 'course_id', onDelete: 'CASCADE' });
Registration.belongsTo(Course, { foreignKey: 'course_id' });

export async function testConnection() {
    try {
        console.log('🧪 Testing database connection...');
        await DATABASE.authenticate();
        console.log('✅ Database connection established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        return false;
    }
}

export async function initializeDatabase() {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`🔄 Database initialization attempt ${retryCount + 1}/${maxRetries}`);
            
            const connected = await testConnection();
            if (!connected) {
                throw new Error('Database connection failed');
            }
            
            console.log('🔄 Synchronizing database schema...');
            await DATABASE.sync({ force: false, alter: false });
            console.log('✅ Database synchronized successfully');
            
            await createDefaultAdmin();
            console.log('✅ Database initialization completed');
            return;
            
        } catch (error) {
            console.error(`❌ Database initialization attempt ${retryCount + 1} failed:`, error.message);
            retryCount++;
            
            if (retryCount < maxRetries) {
                console.log(`⏳ Retrying in ${retryCount * 2} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
            } else {
                console.error('❌ All database initialization attempts failed');
                throw error;
            }
        }
    }
}

// Legacy function for backward compatibility
export async function initializeDatabaseLegacy() {
    try {
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }
        
        await DATABASE.sync({ force: false, alter: false });
        console.log('Database synchronized successfully');
        await createDefaultAdmin();
    } catch (error) {
        console.error('Error initializing database:', error);
        try {
            console.log('Retrying database sync without alter...');
            await DATABASE.sync({ force: false });
            console.log('Database synchronized successfully on retry');
            await createDefaultAdmin();
        } catch (retryError) {
            console.error('Database sync failed on retry:', retryError);
            throw retryError;
        }
    }
}

async function createDefaultAdmin() {
    try {
        console.log('👤 Checking for default admin user...');
        const existingAdmin = await User.findOne({
            where: { email: config.ADMIN_EMAIL }
        });

        if (!existingAdmin) {
            console.log('👤 Creating default admin user...');
            const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD, 12);
            const adminUser = await User.create({
                email: config.ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin'
            });

            console.log('✅ Default admin user created successfully');
            console.log('📧 Admin Email:', config.ADMIN_EMAIL);
            console.log('🔑 Admin Password:', config.ADMIN_PASSWORD);
        } else {
            console.log('ℹ️  Default admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error creating default admin user:', error);
        throw error;
    }
}

export { DATABASE, DATABASE as db };

// Enhanced query function with retry logic
export async function query(sql, params = []) {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
        try {
            const [results] = await DATABASE.query(sql, {
                replacements: params,
                type: sql.trim().toUpperCase().startsWith('SELECT') ? 
                    DATABASE.QueryTypes.SELECT : 
                    DATABASE.QueryTypes.RAW
            });
            return { rows: results };
        } catch (error) {
            console.error(`Database query error (attempt ${retryCount + 1}):`, error.message);
            retryCount++;
            
            if (retryCount < maxRetries) {
                console.log(`⏳ Retrying query in ${retryCount} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            } else {
                console.error('❌ All query attempts failed');
                throw error;
            }
        }
    }
}

// Legacy query function for backward compatibility
export async function queryLegacy(sql, params = []) {
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

// Enhanced connection monitoring
let connectionCheckInterval;

export function startConnectionMonitoring() {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
    }
    
    connectionCheckInterval = setInterval(async () => {
        try {
            await DATABASE.authenticate();
        } catch (error) {
            console.error('⚠️  Database connection lost, attempting to reconnect...', error.message);
            try {
                await DATABASE.authenticate();
                console.log('✅ Database connection restored');
            } catch (reconnectError) {
                console.error('❌ Failed to reconnect to database:', reconnectError.message);
            }
        }
    }, 30000); // Check every 30 seconds
}

export function stopConnectionMonitoring() {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        connectionCheckInterval = null;
    }
}

// Graceful shutdown
export async function closeDatabase() {
    try {
        console.log('🔌 Closing database connections...');
        stopConnectionMonitoring();
        await DATABASE.close();
        console.log('✅ Database connections closed successfully');
    } catch (error) {
        console.error('❌ Error closing database connections:', error);
        throw error;
    }
}