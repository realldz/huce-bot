import { Telegraf } from "telegraf";
import logger from "@/utils/logger";
import { User } from "@/interfaces/user";
import userModel from "@/database/userModel";
import schoolApi from "@/api/schoolApi";
import { formatNotices } from "@/utils/helpers";
import { Notice } from "@/interfaces/sinhvien/notices";
import { BotContext } from "@/interfaces/common";

export async function regularNoticeTask(bot: Telegraf<BotContext>): Promise<void> {
  try {
    const users: User[] | undefined = await userModel.getAllUsers();
    if (!users || users.length === 0) {
      logger.info('Không có người dùng nào để gửi nhắc nhở');
      return;
    }

    for (const user of users) {
      logger.debug(`Đang gửi nhắc nhở cho user ${user.telegramId}`);

      const notices = await schoolApi.getNotices(user.token);
      if (!notices.result || notices.result?.length === 0) {
        logger.debug(`Không có nhắc nhở nào cho user ${user.telegramId}`);
        continue;
      }

      const formattedNotices = formatNotices(notices.result);
      const message = `<b>Nhắc nhở sinh viên:</b>\n\n${formattedNotices}`;

      await bot.telegram.sendMessage(user.telegramId, message, { parse_mode: "HTML" });
      notices.result.forEach((notice: Notice) => {
        schoolApi.updateNoticeStatus(user.token, notice.idMap, notice.id).then(() => {
          logger.debug(`Đã cập nhật trạng thái thông báo ${notice.id} cho user ${user.telegramId}`);
        }).catch((error) => {
          logger.error(`Lỗi khi cập nhật trạng thái thông báo ${notice.id} cho user ${user.telegramId}: ${error}`);
        });
      });
      logger.info(`Đã gửi thông báo cho user ${user.telegramId}`);
    };
  } catch (error) {
    logger.error("Error sending daily notice:", error);
  }
}