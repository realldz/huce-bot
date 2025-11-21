import logger from '@/utils/logger';
import { BotContext } from '@/interfaces/common'; // Import BotContext from common

export const loggingMiddleware = async (ctx: BotContext, next: () => Promise<void>) => {
  if (!ctx.from) {
    logger.error('Không có thông tin người gửi trong context');
    return;
  }

  const userId: number = ctx.from.id;
  const username: string = ctx.from.username ? `@${ctx.from.username}` : 'N/A';
  let action: string | undefined;

  if (ctx.message && 'text' in ctx.message) {
    action = ctx.message.text;
    if (ctx.message.reply_to_message) {
      action = `Reply: ${action} to ${ctx.message.reply_to_message.message_id || 'N/A'}`;
    } else if (ctx.message.entities) {
      action = `Command: ${action}`;
    }
  } else if (ctx.callbackQuery) {
    if ('data' in ctx.callbackQuery) {
      action = `Callback: ${ctx.callbackQuery.data}`;
    }
  }

  logger.info(`Người dùng ${username} (ID: ${userId}) gửi: ${action || 'Không xác định'}`);
  await next();
};
