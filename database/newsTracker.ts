import { dbRun, dbAll } from './db';

const newsTracker = {
  async saveSentNews(newsId: string): Promise<void> {
    await dbRun('INSERT OR IGNORE INTO sent_news (newsId) VALUES (?)', [newsId]);
  },

  async getSentNews(): Promise<string[]> {
    const rows = await dbAll('SELECT newsId FROM sent_news') as { newsId: string }[];
    return rows.map((row) => row.newsId);
  },

  async getTop10SentNews(): Promise<string[]> {
    const rows = await dbAll('SELECT newsId FROM sent_news ORDER BY rowid DESC LIMIT 10') as { newsId: string }[];
    return rows.map((row) => row.newsId);
  }
};

export default newsTracker;
