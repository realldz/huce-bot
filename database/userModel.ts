import { User } from '@/interfaces/user';
import { dbRun, dbGet, dbAll } from './db';

const userModel = {
  async saveUser(telegramId: string, studentId: string, token: string, idSinhVien: number): Promise<void> {
    await dbRun(
      `INSERT OR REPLACE INTO users (telegramId, studentId, token, idSinhVien) VALUES (?, ?, ?, ?)`,
      [telegramId, studentId, token, idSinhVien]
    );
  },

  async getUser(telegramId: string): Promise<User | undefined> {
    const user = await dbGet(`SELECT * FROM users WHERE telegramId = ?`, [telegramId]);
    return user as User | undefined;
  },

  async deleteUser(telegramId: string): Promise<void> {
    await dbRun(`DELETE FROM users WHERE telegramId = ?`, [telegramId]);
  },

  async getAllUsers(): Promise<User[]> {
    const users = await dbAll(`SELECT * FROM users`);
    return users as User[];
  }
};

export default userModel;
