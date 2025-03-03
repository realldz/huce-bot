import { Telegraf } from 'telegraf';
import config from '../config/config.js';
import { requireAuth } from './middleware/auth.js';
import startCmd from './commands/start.js';
import loginCmd from './commands/login.js';
import scheduleCmd from './commands/schedule.js';
import noticesCmd from './commands/notices.js';
import infoCmd from './commands/info.js';
import gradesCmd from './commands/grades.js';
import logoutCmd from './commands/logout.js';
import helpCmd from './commands/help.js'; // Thêm lệnh help
import logger from '../utils/logger.js';

const bot = new Telegraf(config.TELEGRAM_TOKEN);

// Middleware để log cả message và callback query
bot.use(async (ctx, next) => {
 const userId = ctx.from.id;
 const username = ctx.from.username ? `@${ctx.from.username}` : 'N/A';
 let action = ctx.message?.text;

 if (ctx.callbackQuery) {
 action = `Callback: ${ctx.callbackQuery.data}`;
 }

 logger.info(`Người dùng ${username} (ID: ${userId}) gửi: ${action || 'Không xác định'}`);
 await next();
});

// Đăng ký lệnh
bot.start(startCmd.handler);
bot.command('login', loginCmd.handler);
bot.command('schedule', requireAuth, scheduleCmd.handler);
bot.command('notices', requireAuth, noticesCmd.handler);
bot.command('info', requireAuth, infoCmd.handler);
bot.command('grades', requireAuth, gradesCmd.handler(bot));
bot.command('logout', logoutCmd.handler);
bot.command('help', helpCmd.handler); // Đăng ký /help

// Xử lý khi người dùng nhập sai lệnh
bot.on('message', async (ctx) => {
 const text = ctx.message.text || '';
 if (text.startsWith('/')) {
 logger.info(`Người dùng ${ctx.from.username || 'N/A'} (ID: ${ctx.from.id}) nhập sai lệnh: ${text}`);
 await ctx.reply('Lệnh không hợp lệ! Dùng /help để xem danh sách lệnh.');
 }
});

bot.launch().then(() => {
 logger.info('Bot đã khởi động thành công');
});

process.once('SIGINT', () => {
 logger.info('Bot đang dừng (SIGINT)');
 bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
 logger.info('Bot đang dừng (SIGTERM)');
 bot.stop('SIGTERM');
});

export default bot;