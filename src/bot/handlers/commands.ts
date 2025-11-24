import { Telegraf } from 'telegraf';
import { BotContext } from '@/interfaces/common';
import { commandsList } from "../commandsList";

// Import command handlers
import * as commands from '../commands';

// Import middlewares
import { requireAuth } from '../middleware/auth';
import { requireMessage } from '../middleware/messageContext';

export const registerCommands = (bot: Telegraf<BotContext>) => {
  // Đăng ký danh sách lệnh chính vào menu Telegram
  bot.telegram.setMyCommands(
    commandsList
      .filter(cmd => !cmd.command.includes(' ')) // Chỉ lấy lệnh không có tham số
      .map(cmd => ({
        command: cmd.command,
        description: cmd.description
      }))
  );

  // Register all command handlers
  bot.start(requireMessage, commands.start.handler);
  bot.command('login', requireMessage, commands.login.handler);
  bot.command('schedule', requireMessage, commands.schedule.handler);
  bot.command('notices', requireMessage, commands.notices.handler);
  bot.command('info', requireMessage, commands.info.handler);
  bot.command('grades', commands.grades.handler);
  bot.command('news', commands.news.handler);
  bot.command('logout', requireMessage, commands.logout.handler);
  bot.command('help', requireMessage, commands.help.handler);
  bot.command('checkin', commands.checkin.handler(bot));
  bot.command('debt', requireAuth, commands.debt.handler);
};
