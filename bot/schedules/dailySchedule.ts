import { Telegraf } from 'telegraf';
import { BotContext } from '../bot';
import logger from '../../utils/logger';
import { formatListCheckin, formatSchedule, getCurrentIsoDate } from '../../utils/helpers';
import { User } from '../../interfaces/user';
import userModel from '../../database/userModel';
import schoolApi from '../../api/schoolApi';

export async function dailyScheduleTask(bot: Telegraf<BotContext>): Promise<void> {
  try {
    const users: User[] | undefined = await userModel.getAllUsers();
    if (!users || users.length === 0) {
      logger.info('Không có người dùng nào để thông báo');
      return;
    }

    const today = getCurrentIsoDate().toISOString().split('T')[0] + 'T00:00:00.000';

    for (const user of users) {
      try {
        // const schedule = await schoolApi.getSchedule(user.token, today, today);
        // const formattedSchedule = formatSchedule(schedule);
        const schedule = (await schoolApi.getListCheckin(user.token)).result;
        const [formattedSchedule, buttons] = formatListCheckin(schedule);
        logger.info(`Lịch học hôm nay cho user ${user.telegramId}: ${formattedSchedule}`);
        logger.info(`Buttons: ${JSON.stringify(buttons)}`);
        
        if (formattedSchedule[1].length === 0) {
          logger.info(`Không có lịch học cho user ${user.telegramId}`);
          continue;
        }

        const message = `<b>Lịch học hôm nay (${
          today.split('T')[0].split('-')[2]
        }/${today.split('T')[0].split('-')[1]}):</b>\n\n${formattedSchedule}`;
        await bot.telegram.sendMessage(user.telegramId, message, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } });
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