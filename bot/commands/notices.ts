import { BotContext } from '../bot';
import { formatNotices } from '../../utils/helpers';
import logger from '../../utils/logger';

interface Notice {
  title: string;
  content: string;
}
//TODO
export default {
  handler: async (ctx: BotContext): Promise<void> => {
    const schoolApi = (await import('../../api/schoolApi.js')).default;
    try {
      const notices = await schoolApi.getNotices(ctx.state.user!.token);
      if (notices.length === 0) {
        await ctx.reply('Không có nhắc nhở nào!');
        return;
      }

      const text = notices
        .map((item) => `<b>${item.tieuDe}</b>\n${item.moTa}\n<i>Ngày tạo: ${item.ngayTao}</i>`)
        .join('\n\n');
      await ctx.reply(`Danh sách nhắc nhở:\n${text}`, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error(`Lỗi khi lấy nhắc nhở: ${(error as Error).message}`);
      await ctx.reply((error as Error).message || 'Có lỗi khi lấy nhắc nhở!');
    }
  }
};