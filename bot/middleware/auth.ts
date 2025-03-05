import { User } from '../../interfaces/user';
import logger from '../../utils/logger';
import { BotContext } from '../bot';

// Định nghĩa type cho next function trong middleware của Telegraf
type NextFn = () => Promise<void>;

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