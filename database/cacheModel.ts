import { dbRun, dbGet } from './db';

interface Cache {
  key: string;
  value: string;
  expiresAt: number;
}

const cacheModel = {
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const expiresAt = Date.now() + ttl * 1000;
    const serializedValue = JSON.stringify(value);
    await dbRun('INSERT OR REPLACE INTO cache (key, value, expiresAt) VALUES (?, ?, ?)', [key, serializedValue, expiresAt]);
  },

  async get<T>(key: string): Promise<T | null> {
    const row = await dbGet<Cache>('SELECT * FROM cache WHERE key = ?', [key]);
    if (!row) {
      return null;
    }

    if (Date.now() > row.expiresAt) {
      await this.delete(key);
      return null;
    }

    return JSON.parse(row.value) as T;
  },

  async delete(key: string): Promise<void> {
    await dbRun('DELETE FROM cache WHERE key = ?', [key]);
  }
};

export default cacheModel;
