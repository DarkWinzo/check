import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logsDir = join(__dirname, '../logs');

// Create logs directory if it doesn't exist
try {
  mkdirSync(logsDir, { recursive: true });
} catch (error) {
  console.log('Logs directory already exists or created successfully');
}

// Create log streams
const errorLogStream = createWriteStream(join(logsDir, 'error.log'), { flags: 'a' });
const accessLogStream = createWriteStream(join(logsDir, 'access.log'), { flags: 'a' });
const appLogStream = createWriteStream(join(logsDir, 'app.log'), { flags: 'a' });

class Logger {
  constructor() {
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    
    this.currentLevel = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${message} ${metaString}\n`;
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.currentLevel];
  }

  error(message, meta = {}) {
    if (this.shouldLog('ERROR')) {
      const formattedMessage = this.formatMessage('ERROR', message, meta);
      console.error(formattedMessage.trim());
      errorLogStream.write(formattedMessage);
      appLogStream.write(formattedMessage);
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('WARN')) {
      const formattedMessage = this.formatMessage('WARN', message, meta);
      console.warn(formattedMessage.trim());
      appLogStream.write(formattedMessage);
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      const formattedMessage = this.formatMessage('INFO', message, meta);
      console.log(formattedMessage.trim());
      appLogStream.write(formattedMessage);
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('DEBUG')) {
      const formattedMessage = this.formatMessage('DEBUG', message, meta);
      console.log(formattedMessage.trim());
      appLogStream.write(formattedMessage);
    }
  }

  access(message) {
    const formattedMessage = this.formatMessage('ACCESS', message);
    accessLogStream.write(formattedMessage);
  }

  close() {
    errorLogStream.end();
    accessLogStream.end();
    appLogStream.end();
  }
}

export const logger = new Logger();
export default logger;