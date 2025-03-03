import logger from '../../utils/logger.js';

export default {
  handler: async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length !== 2) {
      return ctx.reply('Sai cú pháp! Dùng: /login <mã_sinh_viên> <mật_khẩu>');
    }

    const [studentId, password] = args;
    const schoolApi = (await import('../../api/schoolApi.js')).default;
    const userModel = (await import('../../database/userModel.js')).default;

    try {
      // Kiểm tra xem người dùng đã đăng nhập chưa
      const existingUser = await userModel.getUser(ctx.from.id.toString());
      if (existingUser) {
        return ctx.reply('Mày đã đăng nhập rồi! Dùng /logout để đăng xuất trước khi đăng nhập lại.');
      }

      const { token, idSinhVien } = await schoolApi.login(studentId, password);
      await userModel.saveUser(ctx.from.id.toString(), studentId, token, idSinhVien);
      logger.info(`Người dùng ${ctx.from.username || 'N/A'} (ID: ${ctx.from.id}) đăng nhập thành công với mã SV: ${studentId}`);
      ctx.reply('Đăng nhập thành công! Giờ mày có thể dùng /schedule, /info, /grades hoặc /logout.');
    } catch (error) {
      logger.error(`Lỗi khi đăng nhập: ${error.message}`);
      ctx.reply(error.message || 'Có lỗi khi đăng nhập, thử lại sau!');
    }
  },
};