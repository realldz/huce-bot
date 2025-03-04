import { Telegraf, Context } from 'telegraf';
import config from '../config/config'; 
import { requireAuth } from './middleware/auth'; 
import startCmd from './commands/start'; 
import loginCmd from './commands/login'; 
import scheduleCmd from './commands/schedule'; 
import noticesCmd from './commands/notices'; 
import infoCmd from './commands/info'; 
import gradesCmd from './commands/grades'; 
import logoutCmd from './commands/logout'; 
import helpCmd from './commands/help'; 
import logger from '../utils/logger'; 

// Định nghĩa interface cho context với state tùy chỉnh
export interface BotContext extends Context {
  state: {
    user?: any;
  };
}

// Khởi tạo bot với type BotContext
const bot = new Telegraf<BotContext>(config.TELEGRAM_TOKEN);

// Middleware để log cả message và callback query
bot.use(async (ctx: BotContext, next) => {
  if (!ctx.from) {
    logger.error('Không có thông tin người gửi trong context');
    return; // Không reply vì không biết gửi tới đâu
  }

  const userId: number = ctx.from.id;
  const username: string = ctx.from.username ? `@${ctx.from.username}` : 'N/A';
  let action: string | undefined;

  if (ctx.message && 'text' in ctx.message) {
    action = ctx.message.text;
  } else if (ctx.callbackQuery) {
    if ('data' in ctx.callbackQuery) {
      action = `Callback: ${ctx.callbackQuery.data}`;
    }
  }

  logger.info(`Người dùng ${username} (ID: ${userId}) gửi: ${action || 'Không xác định'}`);
  await next();
});

// Đăng ký lệnh với type handler
bot.start(startCmd.handler);
bot.command('login', loginCmd.handler);
bot.command('schedule', requireAuth, scheduleCmd.handler);
bot.command('notices', requireAuth, noticesCmd.handler);
bot.command('info', requireAuth, infoCmd.handler);
bot.command('grades', requireAuth, gradesCmd.handler(bot));
bot.command('logout', logoutCmd.handler);
bot.command('help', helpCmd.handler);

// Xử lý khi người dùng nhập sai lệnh
bot.on('message', async (ctx: BotContext) => {
  if (!ctx.from || !ctx.message) {
    logger.error('Không có thông tin người gửi hoặc message trong context');
    return;
  }

  if (!('text' in ctx.message)) {
    logger.info(`Người dùng ${ctx.from.username || 'N/A'} (ID: ${ctx.from.id}) gửi message không phải text`);
    return; // Không reply nếu không phải text
  }

  const text: string = ctx.message.text;
  if (text.startsWith('/')) {
    logger.info(`Người dùng ${ctx.from.username || 'N/A'} (ID: ${ctx.from.id}) nhập sai lệnh: ${text}`);
    await ctx.reply('Lệnh không hợp lệ! Dùng /help để xem danh sách lệnh.');
  }
});

export default bot;