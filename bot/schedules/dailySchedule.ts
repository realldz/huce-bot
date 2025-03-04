import { Telegraf } from 'telegraf';
import { BotContext } from '../bot';
import logger from '../../utils/logger';
import { formatSchedule } from '../../utils/helpers';
import { User } from '../../interfaces/user';

export async function dailyScheduleTask(bot: Telegraf<BotContext>): Promise<void> {
  const userModel = (await import('../../database/userModel')).default;
  const schoolApi = (await import('../../api/schoolApi')).default;

  try {
    const users: User[] | undefined = await userModel.getAllUsers();
    if (!users || users.length === 0) {
      logger.info('Không có người dùng nào để thông báo');
      return;
    }

    const today = new Date().toISOString().split('T')[0] + 'T00:00:00.000';

    for (const user of users) {
      try {
        const schedule = await schoolApi.getSchedule(user.token, today, today);
        const formattedSchedule = formatSchedule(schedule);

        if (formattedSchedule.trim() === '') {
          logger.info(`Không có lịch học hôm nay cho user ${user.telegramId}`);
          continue;
        }

        const message = `<b>Lịch học hôm nay (${
          today.split('T')[0].split('-')[2]
        }/${today.split('T')[0].split('-')[1]}):</b>\n\n${formattedSchedule}`;
        await bot.telegram.sendMessage(user.telegramId, message, { parse_mode: 'HTML' });
        logger.info(`Đã gửi thông báo lịch học cho user ${user.telegramId}`);
      } catch (userError) {
        const err = userError as Error;
        logger.error(`Lỗi khi gửi thông báo cho user ${user.telegramId}: ${err.message}`);
      }
    }
  } catch (error) {
    const err = error as Error;
    logger.error(`Lỗi khi lấy danh sách người dùng để thông báo: ${err.message}`);
  }
}