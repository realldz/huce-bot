import { Telegraf } from 'telegraf';
import config from '@/config/config';
import { requireAuth } from './middleware/auth';
import { requireMessage } from './middleware/messageContext';
import { loggingMiddleware } from './middleware/logging';
import logger from '@/utils/logger';
import { commandsList } from "./commandsList";
import { BotContext } from '@/interfaces/common';

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
import debtCmd from './commands/debt';

class TelegramBot {
  private bot: Telegraf<BotContext>;

  constructor(token: string) {
    this.bot = new Telegraf<BotContext>(token);
    this.setupMiddleware();
    this.registerCommands();
    this.registerListeners();
    this.setupGracefulShutdown();
  }

  private setupMiddleware() {
    // Logging middleware
    this.bot.use(loggingMiddleware);

    // Middleware to require authentication for callback queries
    this.bot.use((ctx: BotContext, next) => {
      logger.debug('Register RequireAuth middleware được gọi');
      if (ctx.callbackQuery) {
        return requireAuth(ctx, next);
      }
      return next();
    });
  }

  private registerCommands() {
    // Đăng ký danh sách lệnh chính vào menu Telegram
    this.bot.telegram.setMyCommands(
      commandsList
        .filter(cmd => !cmd.command.includes(' ')) // Chỉ lấy lệnh không có tham số
        .map(cmd => ({
          command: cmd.command,
          description: cmd.description
        }))
    );

    // Register all command handlers
    this.bot.start(requireMessage, startCmd.handler);
    this.bot.command('login', requireMessage, loginCmd.handler);
    this.bot.command('schedule', requireAuth, requireMessage, scheduleCmd.handler);
    this.bot.command('notices', requireAuth, requireMessage, noticesCmd.handler);
    this.bot.command('info', requireAuth, requireMessage, infoCmd.handler);
    this.bot.command('grades', requireAuth, gradesCmd.handler(this.bot));
    this.bot.command('news', requireAuth, newsCmd.handler(this.bot));
    this.bot.command('logout', requireMessage, logoutCmd.handler);
    this.bot.command('help', requireMessage, helpCmd.handler);
    this.bot.command('checkin', requireAuth, checkinCmd.handler(this.bot));
    this.bot.command('debt', requireAuth, debtCmd.handler);
  }

  private registerListeners() {
    // Đăng ký xử lý tin nhắn sau cùng để không chặn lệnh
    this.bot.on('message', requireAuth, requireMessage, checkinCmd.handleReply);

    // Xử lý lệnh không hợp lệ, nhưng bỏ qua tin nhắn reply
    this.bot.use(async (ctx: BotContext, next) => {
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
  }

  private setupGracefulShutdown() {
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  public getBotInstance(): Telegraf<BotContext> {
    return this.bot;
  }
}

const telegramBot = new TelegramBot(config.TELEGRAM_TOKEN);
export default telegramBot.getBotInstance();
