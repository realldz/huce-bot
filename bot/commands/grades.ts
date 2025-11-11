import { Telegraf } from 'telegraf';
import logger from '@/utils/logger';
import {
  fetchGradesAndCache,
  sendOverviewMessage,
  sendSemesterSummaryMessage,
  handleGradesAction,
  handleGradeDetailAction,
} from '@/services/gradeService';

function initGradesActions(bot: Telegraf<any>) {
  bot.action(/grades_(.+)/, async (ctx) => handleGradesAction(ctx));
  bot.action(/gradeDetail_([^|]+)\|(.+)/, async (ctx) => handleGradeDetailAction(ctx));
}


export const handler = (bot: Telegraf<any>) => async (ctx: any) => {
  logger.debug('Bắt đầu xử lý lệnh /grades');

  try {
    const grades = await fetchGradesAndCache(ctx);
    if (!grades) return;

    await sendOverviewMessage(ctx, grades);
    await sendSemesterSummaryMessage(ctx, grades);
    initGradesActions(bot);
  } catch (error) {
    logger.error(`Lỗi khi xử lý /grades: ${(error as Error).message}`);
    ctx.reply('Có lỗi khi lấy kết quả học tập!');
  }
}