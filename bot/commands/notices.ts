import { BotContext } from '../bot';
import { formatNotices } from '../../utils/helpers';
import logger from '../../utils/logger';
import schoolApi from '../../api/schoolApi';
import { Notice } from '../../interfaces/notices';

export default {
  handler: async (ctx: BotContext): Promise<void> => {
    try {
      const notices: Notice[] = (await schoolApi.getNotices(ctx.state.user!.token)).result;
      logger.debug(notices);
      if (notices.length === 0) {
        await ctx.reply('Không có nhắc nhở nào!');
        return;
      }
      const header = '📌 <b>Danh sách nhắc nhở</b> 📌';
      const formattedText = `${header}\n${formatNotices(notices)}`;
      await ctx.reply(formattedText, { parse_mode: 'HTML' });
      notices.forEach(async (notice) => {
        schoolApi.updateNoticeStatus(ctx.state.user!.token, notice.idMap, notice.id);
      });

    } catch (error) {
      logger.error(`Lỗi khi lấy nhắc nhở: ${(error as Error).message}`);
      await ctx.reply((error as Error).message || 'Có lỗi khi lấy nhắc nhở!');
    }
  }
};