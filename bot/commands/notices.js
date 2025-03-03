import { formatNotices } from '../../utils/helpers.js';

export default {
  handler: async (ctx) => {
    const schoolApi = (await import('../../api/schoolApi.js')).default;
    try {
      const notices = await schoolApi.getNotices(ctx.state.user.token);
      const formatted = formatNotices(notices);
      ctx.reply(formatted);
    } catch (error) {
      ctx.reply(error.message || 'Có lỗi khi lấy thông báo!');
    }
  }
};