import { Telegraf } from 'telegraf';
import { BotContext } from '@/interfaces/common';
import logger from '@/utils/logger';
import { formatSchedule } from '@/utils/helpers';
import { User } from '@/interfaces/user';
import userModel from '@/database/userModel';
import schoolApi from '@/api/schoolApi';
import { formatDateStr } from '@/services/scheduleService';
import { getScheduleButtons } from '@/utils/helpers/schedule';

const sendDailyScheduleToUser = async (bot: Telegraf<BotContext>, user: User): Promise<void> => {
  const schedule = await schoolApi.getSchedule(user.token);

  if (!schedule.isOk) {
    logger.error(`Lỗi khi lấy lịch học cho user ${user.telegramId}`);
    return;
  }

  if (!schedule.result || schedule.result.length === 0) {
    logger.info(`Không có lịch học cho user ${user.telegramId}`);
    return;
  }

  const todayStr = formatDateStr(new Date());
  const formattedSchedule = formatSchedule(schedule);
  const buttons = getScheduleButtons('today');

  const message = `<b>Lịch học hôm nay (${todayStr}):</b>\n\n${formattedSchedule}`;

  await bot.telegram.sendMessage(user.telegramId, message, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  });

  logger.info(`Đã gửi thông báo lịch học cho user ${user.telegramId}`);
};

export async function dailyScheduleTask(bot: Telegraf<BotContext>): Promise<void> {
  try {
    const users = await userModel.getAllUsers();
    if (!users || users.length === 0) {
      logger.info('Không có người dùng nào để thông báo');
      return;
    }

    for (const user of users) {
      try {
        await sendDailyScheduleToUser(bot, user);
      } catch (userError) {
        logger.error(`Lỗi khi gửi thông báo cho user ${user.telegramId}: ${(userError as Error).message}`);
      }
    }
  } catch (error) {
    logger.error(`Lỗi khi lấy danh sách người dùng để thông báo: ${(error as Error).message}`);
  }
}