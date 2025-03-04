import { BotContext } from '../bot';
import logger from '../../utils/logger';
import { User } from '../../interfaces/user';
import { AuthResult } from '../../interfaces/auth';

export default {
  handler: async (ctx: BotContext): Promise<void> => {
    if (!ctx.from || !ctx.message) {
      logger.error('Không có thông tin người gửi trong context');
      ctx.reply('Có lỗi xử lý yêu cầu, thử lại sau!');
      return;
    }

    // Type guard để kiểm tra xem message có text không
    if (!('text' in ctx.message)) {
      logger.error('Message không phải dạng text');
      ctx.reply('Vui lòng gửi lệnh dạng text, ví dụ: /login <mã_sinh_viên> <mật_khẩu>');
      return;
    }
    
    const args: string[] = ctx.message.text.split(' ').slice(1);
    if (args.length !== 2) {
      ctx.reply('Sai cú pháp! Dùng: /login <mã_sinh_viên> <mật_khẩu>');
      return;
    }

    const [studentId, password]: [string, string] = args as [string, string];
    const schoolApi = (await import('../../api/schoolApi.js')).default; // Sẽ đổi thành .ts sau
    const userModel = (await import('../../database/userModel.js')).default; // Sẽ đổi thành .ts sau

    try {
      // Kiểm tra xem người dùng đã đăng nhập chưa
      const existingUser: User | undefined = await userModel.getUser(ctx.from.id.toString());
      if (existingUser) {
        ctx.reply('Đã đăng nhập. Dùng /logout để đăng xuất trước khi đăng nhập lại.');
        return;
      }

      const { token, idSinhVien }: AuthResult = await schoolApi.login(studentId, password);
      await userModel.saveUser(ctx.from.id.toString(), studentId, token, idSinhVien);
      logger.info(`Người dùng ${ctx.from.username || 'N/A'} (ID: ${ctx.from.id}) đăng nhập thành công với mã SV: ${studentId}`);
      ctx.reply('Đăng nhập thành công! Dùng /help để xem danh sách lệnh.');
    } catch (error) {
      logger.error(`Lỗi khi đăng nhập: ${(error as Error).message}`);
      ctx.reply((error as Error).message || 'Có lỗi khi đăng nhập, thử lại sau!');
    }
  },
};