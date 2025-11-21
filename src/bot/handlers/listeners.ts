import { Telegraf } from "telegraf";
import { BotContext } from "@/interfaces/common";
import logger from "@/utils/logger";
import { requireAuth } from "../middleware/auth";
import { requireMessage } from "../middleware/messageContext";
import { checkin } from "../commands";

//TODO: Fix middleware order issue
export const registerListeners = (bot: Telegraf<BotContext>) => {
  // Đăng ký xử lý tin nhắn reply (dùng cho checkin)
  // Phải được đăng ký trước middleware xử lý lệnh không hợp lệ
  // bot.on('message', requireMessage, checkin.handler(bot));
  // Xử lý lệnh không hợp lệ, nhưng bỏ qua tin nhắn reply và callback query
  bot.use(async (ctx: BotContext, next) => {
    // Bỏ qua nếu là callback query hoặc không có message
    if (ctx.callbackQuery || !ctx.message) {
      return next();
    }

    // Bỏ qua nếu tin nhắn là một reply
    if ("reply_to_message" in ctx.message) {
      return next();
    }

    // Xử lý nếu là lệnh không xác định (bắt đầu bằng /)
    if ("text" in ctx.message && ctx.message.text.startsWith("/")) {
      logger.info(
        `Người dùng ${ctx.from?.username || "N/A"} (ID: ${ctx.from?.id}) nhập sai lệnh: ${ctx.message.text}`,
      );
      await ctx.reply("Lệnh không hợp lệ! Dùng /help để xem danh sách lệnh.");
      return; // Dừng xử lý chuỗi middleware
    }

    // Chuyển cho middleware tiếp theo nếu không phải các trường hợp trên
    return next();
  });
};
