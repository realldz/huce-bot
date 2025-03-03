import { BotContext } from '../bot';
import { formatNotices } from '../../utils/helpers.js'; // Sẽ đổi thành .ts sau

// Định nghĩa interface cho dữ liệu từ API getNotices
interface Notice {
  title: string;
  content: string;
}

// Định nghĩa interface cho context với state tùy chỉnh
interface NoticesContext extends BotContext {
  state: {
    user: {
      token: string;
    };
  };
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