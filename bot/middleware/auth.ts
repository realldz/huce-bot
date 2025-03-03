import { BotContext } from '../bot';

// Định nghĩa interface cho user từ database
interface User {
  telegramId: string;
  studentId: string;
  token: string;
  idSinhVien: number;
}

// Định nghĩa type cho next function trong middleware của Telegraf
type NextFn = () => Promise<void>;

// Định nghĩa interface cho context với state tùy chỉnh
// interface AuthContext extends Context {
//   state: {
//     user?: User;
//   };
// }

// Middleware requireAuth với type
export const requireAuth = async (ctx: BotContext, next: NextFn): Promise<void> => {
  const userModel = (await import('../../database/userModel.js')).default; // Sẽ đổi thành .ts sau
  if (!ctx.from) {
    ctx.reply('Có lỗi xử lý yêu cầu, thử lại sau!');
    return;
  }
  const user: User | undefined = await userModel.getUser(ctx.from.id.toString());
  if (!user || !user.token) {
    ctx.reply('Mày chưa đăng nhập! Dùng /login trước.');
    return;
  }
  ctx.state.user = user; // Lưu user vào state
  return next();
};