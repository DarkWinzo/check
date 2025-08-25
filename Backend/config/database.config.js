// Database-specific configuration
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const databaseConfig = {
  // SQLite Configuration (Default)
  sqlite: {
    dialect: 'sqlite',
    storage: join(__dirname, '../database/store/student-registration.db'),
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  
  // PostgreSQL Configuration
  postgres: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'student_registration',
    username: 'postgres',
    password: 'your_password',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    dialectOptions: {
      ssl: false // Set to true for production with SSL
    }
  },
  
  // Connection Pool Configuration
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}

export default databaseConfig