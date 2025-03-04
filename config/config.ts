import 'dotenv/config';

interface Config {
  TELEGRAM_TOKEN: string;
  SCHOOL_API_URL: string;
  DB_PATH: string;
  CLIENT_SECRET: string;
  SCHOOL_CODE: string;
}

const config: Config = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || '',
  SCHOOL_API_URL: process.env.SCHOOL_API_URL || '',
  DB_PATH: process.env.DB_PATH || './database/users.db',
  CLIENT_SECRET: process.env.CLIENT_SECRET || '',
  SCHOOL_CODE: process.env.SCHOOL_CODE || '',
};

export default config;