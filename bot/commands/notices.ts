import { BotContext } from '@/interfaces/common';
import { formatNotices } from '@/utils/helpers';
import logger from '@/utils/logger';
import schoolApi from '@/api/schoolApi';
import { Notice } from '@/interfaces/sinhvien/notices';


export const handler = async (ctx: BotContext): Promise<void> => {
  try {
    const notices = await schoolApi.getNotices(ctx.state.user!.token);
    if (!notices.result) {
      await ctx.reply('Không có nhắc nhở nào!');
      return;
    }
    const header = '📌 <b>Danh sách nhắc nhở</b> 📌';
    const formattedText = `${header}\n${formatNotices(notices.result)}`;
    await ctx.reply(formattedText, { parse_mode: 'HTML' });
    notices.result.forEach(async (notice) => {
      schoolApi.updateNoticeStatus(ctx.state.user!.token, notice.idMap, notice.id);
    });

  } catch (error) {
    logger.error(`Lỗi khi lấy nhắc nhở: ${(error as Error).message}`);
    await ctx.reply((error as Error).message || 'Có lỗi khi lấy nhắc nhở!');
  }
}