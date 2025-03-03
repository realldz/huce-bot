import 'dotenv/config';

export default {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || '',
  SCHOOL_API_URL: process.env.SCHOOL_API_URL || '',
  DB_PATH: process.env.DB_PATH || './database/users.db',
  CLIENT_SECRET: process.env.CLIENT_SECRET || '',
};