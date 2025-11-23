import { Telegraf } from 'telegraf';
import logger from '@/utils/logger';
import * as gradeService from '@/services/gradeService';
import { BotContext } from '@/interfaces/common';
import { GradesResponse } from '@/interfaces/sinhvien/grades';
import { InlineKeyboardButton } from '@telegraf/types';

export function initGradesActions(bot: Telegraf<BotContext>) {
  bot.action(/grade\/detail\/([^|]+)/, async (ctx) => handleGradeDetailAction(ctx));
  bot.action(/grade\/(.+)/, async (ctx) => handleGradesAction(ctx));
  bot.action(/grade/, async (ctx) => handler(ctx));

}

async function handleGradesAction(ctx: BotContext) {
  const [replyText, buttons] = await gradeService.handleGradesAction(ctx);
  const backButton = { text: 'Quay lại', callback_data: 'grade' }
  buttons.push([backButton]);
  await ctx.editMessageText(
    replyText.join('\n\n'),
    {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    }
  )

  await ctx.answerCbQuery();

}

async function handleGradeDetailAction(ctx: BotContext) {
  const [tenMonHoc, rowsText, idDot] = await gradeService.handleGradeDetailAction(ctx);
  const backButton: InlineKeyboardButton[][] = [[{ text: 'Quay lại', callback_data: `grade/${idDot}` }]];
  if (tenMonHoc) {
    await ctx.editMessageText(
      `<b>Chi tiết điểm:</b> ${tenMonHoc}\n${rowsText}`,
      {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: backButton }
      });
  } else {
    await ctx.reply('Dữ liệu đã hết hạn, thử gửi lại /grades!');
  }
  await ctx.answerCbQuery();
}

async function handleGradeHomeAction(ctx: BotContext, grades: GradesResponse) {
  const overview = await gradeService.sendOverviewMessage(ctx, grades);
  const [semesterSummary, buttons = []] = await gradeService.sendSemesterSummaryMessage(ctx, grades);

  const responseText = `<b>Tổng quan kết quả học tập:</b>\n${overview}\n\n<b>Tổng kết học kỳ:</b>\n\n${semesterSummary}\n\nChọn học kỳ để xem chi tiết:`;

  if (ctx.message && !ctx.callbackQuery)
    await ctx.reply(responseText, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  else if (ctx.callbackQuery) {
    await ctx.editMessageText(responseText, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
    await ctx.answerCbQuery();
  }
}

export const handler = async (ctx: BotContext) => {
  logger.debug('Bắt đầu xử lý lệnh /grades');

  try {
    const grades = await gradeService.fetchGradesAndCache(ctx);
    if (!grades) {
      ctx.reply('Không có dữ liệu kết quả học tập');
      return;
    }

    await handleGradeHomeAction(ctx, grades);

  } catch (error) {
    logger.error(`Lỗi khi xử lý /grades: ${(error as Error).message}`);
    ctx.reply('Có lỗi khi lấy kết quả học tập!');
  }
}