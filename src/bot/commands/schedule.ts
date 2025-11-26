import { BotContext } from '@/interfaces/common';
import logger from '@/utils/logger';
import {
  parseArguments,
  fetchSchedule,
  toIsoDate,
  determineScheduleMode,
  ScheduleMode
} from '@/services/scheduleService';
import { getScheduleButtons } from '@/utils/helpers/schedule';
import { Telegraf } from 'telegraf';

const sendScheduleMessages = async (
  ctx: BotContext,
  messages: string[],
  mode: ScheduleMode,
  currentDate?: string,
  weekStart?: string
) => {
  const buttons = getScheduleButtons(mode, currentDate, weekStart);
  for (let i = 0; i < messages.length; i++) {
    const isLast = i === messages.length - 1;
    const options: any = { parse_mode: 'HTML' };
    if (isLast && buttons.length > 0) {
      options.reply_markup = { inline_keyboard: buttons };
    }

    if (ctx.callbackQuery && i === 0) {
      await ctx.editMessageText(messages[i], options);
    } else {
      await ctx.reply(messages[i], options);
    }
  }
};

// Action handler: Xem lịch theo ngày cụ thể
const handleDateAction = async (ctx: BotContext & { match: RegExpExecArray }) => {
  try {
    const dateStr = ctx.match[1];
    const { mode, currentDate } = determineScheduleMode([dateStr]);
    const { tuNgay, denNgay, timeRangeMessage } = parseArguments([dateStr]);

    const messages = await fetchSchedule(ctx, tuNgay, denNgay, timeRangeMessage);
    await sendScheduleMessages(ctx, messages, mode, currentDate);
    await ctx.answerCbQuery();
  } catch (error) {
    await ctx.answerCbQuery((error as Error).message || 'Có lỗi!');
  }
};

// Action handler: Xem lịch theo tuần
const handleWeekAction = async (ctx: BotContext & { match: RegExpExecArray }) => {
  try {
    const startStr = ctx.match[1];
    const endStr = ctx.match[2];
    const tuNgay = toIsoDate(startStr);
    const denNgay = toIsoDate(endStr);
    const timeRangeMessage = `<b>Lịch tuần:</b> ${startStr} - ${endStr}`;

    const messages = await fetchSchedule(ctx, tuNgay, denNgay, timeRangeMessage);
    await sendScheduleMessages(ctx, messages, 'week', undefined, startStr);
    await ctx.answerCbQuery();
  } catch (error) {
    await ctx.answerCbQuery((error as Error).message || 'Có lỗi!');
  }
};

// Action handler: Xem lịch hôm nay
const handleTodayAction = async (ctx: BotContext) => {
  try {
    const { tuNgay, denNgay, timeRangeMessage } = parseArguments([]);
    const messages = await fetchSchedule(ctx, tuNgay, denNgay, timeRangeMessage);
    await sendScheduleMessages(ctx, messages, 'today');
    await ctx.answerCbQuery();
  } catch (error) {
    await ctx.answerCbQuery((error as Error).message || 'Có lỗi!');
  }
};

export const initScheduleActions = (bot: Telegraf<BotContext>) => {
  bot.action('schedule/today', handleTodayAction);
  bot.action(/schedule\/date\/(\d{2}\/\d{2}\/\d{4})/, handleDateAction);
  bot.action(/schedule\/week\/(\d{2}\/\d{2}\/\d{4})_(\d{2}\/\d{2}\/\d{4})/, handleWeekAction);
};

export const handler = async (ctx: BotContext): Promise<void> => {
  if (!ctx.from || !ctx.message) {
    logger.error('Không có thông tin người gửi trong context');
    return;
  }
  if (!('text' in ctx.message)) {
    logger.error('Message không phải dạng text');
    ctx.reply('Vui lòng gửi lệnh dạng text, ví dụ: /schedule [week|DD/MM/YYYY]');
    return;
  }

  const args: string[] = ctx.message?.text.split(' ').slice(1);

  try {
    const { tuNgay, denNgay, timeRangeMessage } = parseArguments(args);
    const messages = await fetchSchedule(ctx, tuNgay, denNgay, timeRangeMessage);
    const { mode, currentDate, weekStart } = determineScheduleMode(args);

    await sendScheduleMessages(ctx, messages, mode, currentDate, weekStart);
  } catch (error) {
    ctx.reply((error as Error).message || 'Có lỗi khi lấy lịch học!');
  }
}

