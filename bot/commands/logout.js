import logger from '../../utils/logger.js';

export default {
  handler: async (ctx) => {
    const userModel = (await import('../../database/userModel.js')).default;

    try {
      // Kiểm tra xem người dùng đã đăng nhập chưa
      const existingUser = await userModel.getUser(ctx.from.id.toString());
      if (!existingUser) {
        return ctx.reply('Mày chưa đăng nhập mà! Dùng /login để đăng nhập.');
      }

      await userModel.deleteUser(ctx.from.id.toString());
      logger.info(`Người dùng ${ctx.from.username || 'N/A'} (ID: ${ctx.from.id}) đã đăng xuất`);
      ctx.reply('Đăng xuất thành công! Dùng /login để đăng nhập lại.');
    } catch (error) {
      logger.error(`Lỗi khi đăng xuất: ${error.message}`);
      ctx.reply('Có lỗi khi đăng xuất, thử lại sau!');
    }
  },
};