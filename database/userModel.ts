import { User } from '../interfaces/user.js';
import db from './db.js'; // Giữ nguyên import này, sẽ đổi sang .ts sau


class UserModel {
  async saveUser(telegramId: string, studentId: string, token: string, idSinhVien: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT studentId FROM users WHERE telegramId = ?`, 
        [telegramId],
        (err: Error | null, row: { studentId: string } | undefined) => {
          if (err) return reject(err);
          if (row && row.studentId !== studentId) {
            return reject(new Error('Tài khoản Telegram này đã gắn với mã sinh viên khác!'));
          }

          db.run(
            `INSERT OR REPLACE INTO users (telegramId, studentId, token, idSinhVien) VALUES (?, ?, ?, ?)`,
            [telegramId, studentId, token, idSinhVien],
            (err: Error | null) => {
              if (err) reject(err);
              else resolve();
            }
          );
        }
      );
    });
  }

  async getUser(telegramId: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE telegramId = ?`,
        [telegramId],
        (err: Error | null, row: User | undefined) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async deleteUser(telegramId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM users WHERE telegramId = ?`,
        [telegramId],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getAllUsers(): Promise<User[] | undefined> {  
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM users`, (err: Error | null, rows: User[]) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

export default new UserModel();