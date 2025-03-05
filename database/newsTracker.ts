import db from './db.js'; // Giữ nguyên import như mày yêu cầu
import logger from '../utils/logger';

class NewsTracker {
  async saveSentNews(newsId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO sent_news (newsId) VALUES (?)',
        [newsId],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getSentNews(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT newsId FROM sent_news',
        (err: Error | null, rows: { newsId: string }[]) => {
          if (err) reject(err);
          else resolve(rows.map((row) => row.newsId));
        }
      );
    });
  }
}

export default new NewsTracker();