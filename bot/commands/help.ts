import { BotContext } from '../bot';
import logger from '../../utils/logger'; 

// Định nghĩa interface cho context cơ bản
interface HelpContext extends BotContext {}

export default {
  handler: async (ctx: BotContext): Promise<void> => {
    const helpText: string = `
<b>Danh sách lệnh:</b>
/help - Hiển thị menu này
/login <code>mã_sinh_viên</code> <code>mật_khẩu</code> - Đăng nhập bằng tài khoản sinh viên
/logout - Đăng xuất khỏi bot
/schedule - Lấy lịch học hôm nay
/schedule <code>ngày</code> - Lấy lịch học ngày cụ thể (VD: /schedule 31/12/2025)
/schedule <code>từ_ngày</code> <code>đến_ngày</code> - Lấy lịch học trong khoảng thời gian (VD: /schedule 01/12/2025 31/12/2025)
/schedule week - Lấy lịch học tuần này
/info - Xem thông tin cá nhân sinh viên
/grades - Xem kết quả học tập

<b>Lưu ý:</b>
- Định dạng ngày: DD/MM/YYYY
- Phải đăng nhập trước khi dùng các lệnh /schedule, /info, /grades
- Sai lệnh? Dùng /help để xem lại!
    `;
    logger.info(`Người dùng ${ctx.from?.username || 'N/A'} (ID: ${ctx.from?.id}) yêu cầu menu /help`);
    await ctx.reply(helpText, { parse_mode: 'HTML' });
  },
};