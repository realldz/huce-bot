import sqlite3 from 'sqlite3';
import config from '../config/config.js'; // Giữ nguyên như Bạn yêu cầu

// Định nghĩa type cho sqlite3.Database
const db: sqlite3.Database = new sqlite3.Database(config.DB_PATH, (err: Error | null) => {
  if (err) {
    console.error('Error connecting to SQLite:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Tạo bảng users và sent_news
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      telegramId TEXT PRIMARY KEY,
      studentId TEXT UNIQUE,
      token TEXT,
      idSinhVien INTEGER
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS sent_news (
      newsId TEXT PRIMARY KEY
    )
  `);
});

export default db;