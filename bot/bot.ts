import { Telegraf, Context } from 'telegraf';
import config from '../config/config';
import { requireAuth } from './middleware/auth';
import { requireMessage } from './middleware/messageContext';
import startCmd from './commands/start';
import loginCmd from './commands/login';
import scheduleCmd from './commands/schedule';
import noticesCmd from './commands/notices';
import infoCmd from './commands/info';
import gradesCmd from './commands/grades';
import logoutCmd from './commands/logout';
import helpCmd from './commands/help';
import newsCmd from './commands/news';
import checkinCmd from './commands/checkin';
import logger from '../utils/logger';
import { commandsList } from "./commandsList";

export interface BotContext extends Context {
  state: {
    user?: any;
    studentId?: string;
  };
}

const bot = new Telegraf<BotContext>(config.TELEGRAM_TOKEN, { handlerTimeout: Infinity });
// Middleware để log cả message và callback query
bot.use(async (ctx: BotContext, next) => {
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
});

// Middleware to require authentication for callback queries
bot.use((ctx: BotContext, next) => {
  logger.debug('Register RequireAuth middleware được gọi');
  if (ctx.callbackQuery) {
    return requireAuth(ctx, next);
  }
  return next();
});

// Đăng ký danh sách lệnh chính vào menu Telegram
bot.telegram.setMyCommands(
  commandsList
    .filter(cmd => !cmd.command.includes(' ')) // Chỉ lấy lệnh không có tham số
    .map(cmd => ({
      command: cmd.command,
      description: cmd.description
    }))
);

bot.start(requireMessage, startCmd.handler);
bot.command('login', requireMessage, loginCmd.handler);
bot.command('schedule', requireAuth, requireMessage, scheduleCmd.handler);
bot.command('notices', requireAuth, requireMessage, noticesCmd.handler);
bot.command('info', requireAuth, requireMessage, infoCmd.handler);
bot.command('grades', requireAuth, gradesCmd.handler(bot));
bot.command('news', requireAuth, newsCmd.handler(bot));
bot.command('logout', requireMessage, logoutCmd.handler);
bot.command('help', requireMessage, helpCmd.handler);
bot.command('checkin', requireAuth, checkinCmd.handler(bot));
// Đăng ký xử lý tin nhắn sau cùng để không chặn lệnh
bot.on('message', requireAuth, requireMessage, checkinCmd.handleReply);

// Xử lý lệnh không hợp lệ, nhưng bỏ qua tin nhắn reply
bot.use(async (ctx: BotContext, next) => {
  if (ctx.callbackQuery) {
    return next(); // Bỏ qua nếu là callback query
  }

  if (!ctx.from || !ctx.message) {
    logger.error('Không có thông tin người gửi hoặc message trong context');
    return;
  }

  if (ctx.message && 'reply_to_message' in ctx.message) {
    return next(); // Bỏ qua nếu tin nhắn là phản hồi
  }

  if ('text' in ctx.message && ctx.message.text.startsWith('/')) {
    logger.info(`Người dùng ${ctx.from.username || 'N/A'} (ID: ${ctx.from.id}) nhập sai lệnh: ${ctx.message.text}`);
    await ctx.reply('Lệnh không hợp lệ! Dùng /help để xem danh sách lệnh.');
    return;
  }

  await next();
});

export default bot;
