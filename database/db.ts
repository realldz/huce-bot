import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import config from '../config/config';
import logger from '../utils/logger';

const db = new sqlite3.Database(config.DB_PATH, (err: Error | null) => {
  if (err) {
    logger.error('Error connecting to SQLite:', err);
  } else {
    logger.info('Connected to SQLite database');
  }
});

// Promisify db methods
export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db)) as <T>(sql: string, params: any) => Promise<T>;
export const dbAll = promisify(db.all.bind(db)) as <T>(sql: string, params?: any) => Promise<T[]>;

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      telegramId TEXT PRIMARY KEY,
      studentId TEXT,
      token TEXT,
      idSinhVien INTEGER
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS sent_news (
      newsId TEXT PRIMARY KEY
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      value TEXT,
      expiresAt INTEGER
    )
  `);
});

export default db;