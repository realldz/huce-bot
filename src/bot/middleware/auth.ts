import { User } from '@/interfaces/user';
import logger from '@/utils/logger';
import { BotContext } from '@/interfaces/common';
import userModel from "@/database/userModel";
// Định nghĩa type cho next function trong middleware của Telegraf
type NextFn = () => Promise<void>;

// Middleware requireAuth với type
export const requireAuth = async (ctx: BotContext, next: NextFn): Promise<void> => {
  logger.debug('RequireAuth middleware được gọi');
  if (!ctx.from) {
    await ctx.reply('Có lỗi xử lý yêu cầu, thử lại sau!');
    return;
  }

  if (ctx.message && 'text' in ctx.message) {
    const message = ctx.message.text;
    const command = message.split(' ')[0];
    const publicCommands = ['/login', '/help']

    // Nếu là lệnh công khai -> bỏ qua middleware
    if (publicCommands.includes(command)) {
      return next()
    }
  }

  const user: User | undefined = await userModel.getUser(ctx.from.id.toString());
  if (!user || !user.token) {
    await ctx.reply('Bạn chưa đăng nhập! Dùng /login trước.');
    return;
  }

  ctx.state.user = user; // Lưu user vào state
  ctx.state.studentId = user.studentId; // Lưu studentId vào state
  return next();
};