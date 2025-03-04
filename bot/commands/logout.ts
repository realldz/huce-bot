import { BotContext } from '../bot';
import logger from '../../utils/logger';
import { User } from '../../interfaces/user'

export default {
  handler: async (ctx: BotContext): Promise<void> => {
    const userModel = (await import('../../database/userModel.js')).default; // Sẽ đổi thành .ts sau

    try {
      // Kiểm tra xem ctx.from có tồn tại không
      if (!ctx.from) {
        logger.error('Không có thông tin người gửi trong context');
        ctx.reply('Có lỗi xử lý yêu cầu, thử lại sau!');
        return;
      }

      // Kiểm tra xem người dùng đã đăng nhập chưa
      const existingUser: User | undefined = await userModel.getUser(ctx.from.id.toString());
      if (!existingUser) {
        ctx.reply('Mày chưa đăng nhập mà! Dùng /login để đăng nhập.');
        return;
      }

      await userModel.deleteUser(ctx.from.id.toString());
      logger.info(`Người dùng @${ctx.from.username || 'N/A'} (ID: ${ctx.from.id}) đã đăng xuất`);
      ctx.reply('Đăng xuất thành công! Dùng /login để đăng nhập lại.');
    } catch (error) {
      const err = error as Error; // Ép kiểu error để lấy .message
      logger.error(`Lỗi khi đăng xuất: ${err.message}`);
      ctx.reply('Có lỗi khi đăng xuất, thử lại sau!');
    }
  },
};