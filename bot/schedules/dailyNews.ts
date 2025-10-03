import { Telegraf } from 'telegraf';
import { BotContext } from '../bot';
import logger from '../../utils/logger';
import newsTracker from '../../database/newsTracker';
import userModel from '../../database/userModel';
import schoolApi from '../../api/schoolApi';

export async function dailyNewsTask(bot: Telegraf<BotContext>): Promise<void> {
  try {
    const users = await userModel.getAllUsers();
    if (!users || users.length === 0) {
      logger.info('Không có người dùng nào để gửi tin tức');
      return;
    }

    const newsItems = await schoolApi.getNews(users[0].token);

    if (newsItems.length === 0) {
      logger.info('Không có tin tức nào từ crawl');
      return;
    }

    const sentNews = await newsTracker.getSentNews();
    const newItems = newsItems.filter((item) => !sentNews.includes(item.id));

    if (newItems.length === 0) {
      logger.info('Không có tin tức mới để gửi');
      return;
    }

    const text = newItems
      .map((item) => `<b>${item.title}</b>\n${item.date}\n<a href="${item.link}">Xem chi tiết</a>`)
      .join('\n\n');
    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.telegramId, `Tin tức mới:\n${text}`, { parse_mode: 'HTML' });
        logger.info(`Đã gửi ${newItems.length} tin tức mới cho user ${user.telegramId}`);
      } catch (error) {
        logger.error(`Lỗi khi gửi tin tức cho user ${user.telegramId}: ${(error as Error).message}`);
      }
    }

    for (const item of newItems) {
      await newsTracker.saveSentNews(item.id);
    }
  } catch (error) {
    logger.error(`Lỗi khi crawl tin tức hàng ngày: ${(error as Error).message}`);
  }
}