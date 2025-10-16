import 'dotenv/config';

interface Config {
  TELEGRAM_TOKEN: string;
  SCHOOL_API_BASEURL: string;
  DB_PATH: string;
  CLIENT_SECRET: string;
  SCHOOL_CODE: string;
  LOG_LEVEL?: string;
  WEBHOOK_DOMAIN?: string;
  WEBHOOK_PATH?: string;
  PORT?: number;
}

const config: Config = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || '',
  SCHOOL_API_BASEURL: process.env.SCHOOL_API_BASEURL || '',
  DB_PATH: process.env.DB_PATH || './database/users.db',
  CLIENT_SECRET: process.env.CLIENT_SECRET || '',
  SCHOOL_CODE: process.env.SCHOOL_CODE || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN || '',
  WEBHOOK_PATH: process.env.WEBHOOK_PATH || '',
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
}

export default config;