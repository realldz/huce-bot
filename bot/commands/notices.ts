import { BotContext } from '../bot';
import { formatNotices } from '../../utils/helpers';

interface Notice {
  title: string;
  content: string;
}

export default {
  handler: async (ctx: BotContext): Promise<void> => {
    const schoolApi = (await import('../../api/schoolApi')).default; // Sẽ đổi thành .ts sau
    try {
      const notices: Notice[] = await schoolApi.getNotices(ctx.state.user.token);
      const formatted: string = formatNotices(notices);
      ctx.reply(formatted);
    } catch (error) {
      ctx.reply((error as Error).message || 'Có lỗi khi lấy thông báo!');
    }
  },
};