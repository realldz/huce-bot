import db from './db.js';

class UserModel {
  async saveUser(telegramId, studentId, token, idSinhVien) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT studentId FROM users WHERE telegramId = ?`,
        [telegramId],
        (err, row) => {
          if (err) return reject(err);
          if (row && row.studentId !== studentId) {
            return reject(new Error('Tài khoản Telegram này đã gắn với mã sinh viên khác!'));
          }

          db.run(
            `INSERT OR REPLACE INTO users (telegramId, studentId, token, idSinhVien) VALUES (?, ?, ?, ?)`,
            [telegramId, studentId, token, idSinhVien],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        }
      );
    });
  }

  getUser(telegramId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE telegramId = ?`,
        [telegramId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async deleteUser(telegramId) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM users WHERE telegramId = ?`,
        [telegramId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

export default new UserModel();