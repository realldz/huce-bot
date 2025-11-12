import { Telegraf } from 'telegraf';
import config from '@/config/config';
import { requireAuth } from './middleware/auth';
import { loggingMiddleware } from './middleware/logging';
import logger from '@/utils/logger';
import { BotContext } from '@/interfaces/common';
import { registerCommands } from './handlers/commands';
import { registerListeners } from './handlers/listeners';
import { onlyAllowPrivateChat } from './middleware/onlyAllowPrivateChat';

const setupMiddleware = (bot: Telegraf<BotContext>) => {
  // Logging middleware
  bot.use(onlyAllowPrivateChat);
  bot.use(loggingMiddleware);
  bot.use(requireAuth);
};

const registerHandlers = (bot: Telegraf<BotContext>) => {
  registerCommands(bot);
  registerListeners(bot);
};

const setupGracefulShutdown = (bot: Telegraf<BotContext>) => {
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

const initializeBot = (token: string): Telegraf<BotContext> => {
  const bot = new Telegraf<BotContext>(token);

  // Áp dụng các cấu hình
  setupMiddleware(bot);
  registerHandlers(bot);
  setupGracefulShutdown(bot);

  return bot;
};

// Khởi tạo và export bot instance
const bot = initializeBot(config.TELEGRAM_TOKEN);

export default bot;
