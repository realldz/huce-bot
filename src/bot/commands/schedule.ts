
import { BotContext } from '@/interfaces/common';
import logger from '@/utils/logger';
import { parseArguments, fetchAndReplySchedule } from '@/services/scheduleService';

export const handler = async (ctx: BotContext): Promise<void> => {
  if (!ctx.from || !ctx.message) {
    logger.error('Không có thông tin người gửi trong context');
    return;
  }
  if (!('text' in ctx.message)) {
    logger.error('Message không phải dạng text');
    ctx.reply('Vui lòng gửi lệnh dạng text, ví dụ: /login <mã_sinh_viên> <mật_khẩu>');
    return;
  }

  const args: string[] = ctx.message?.text.split(' ').slice(1);

  try {
    const { tuNgay, denNgay, timeRangeMessage } = parseArguments(args);
    await fetchAndReplySchedule(ctx, tuNgay, denNgay, timeRangeMessage);
  } catch (error) {
    ctx.reply((error as Error).message || 'Có lỗi khi lấy lịch học!');
  }
}

