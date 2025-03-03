export const requireAuth = async (ctx, next) => {
  const userModel = (await import("../../database/userModel.js")).default;
  const user = await userModel.getUser(ctx.from.id.toString());
  if (!user || !user.token) {
    return ctx.reply("Mày chưa đăng nhập! Dùng /login trước.");
  }
  ctx.state.user = user; // Lưu user vào state để dùng trong các handler sau
  return next();
};
