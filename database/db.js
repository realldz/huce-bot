import sqlite3 from 'sqlite3';
import config from '../config/config.js';

const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      telegramId TEXT PRIMARY KEY,
      studentId TEXT UNIQUE,
      token TEXT,
      idSinhVien INTEGER
    )
  `);
});

export default db;