import { BotContext } from '../bot';

export default {
  handler: (ctx: BotContext) => {
    ctx.reply(
      'Hi! Đăng nhập bằng /login <code>mã_sinh_viên</code> <code>mật_khẩu</code> để bắt đầu nhé. Thông tin chỉ dùng để đăng nhập và bot không lưu lại đâu, yên tâm!.',
      { parse_mode: 'HTML' }
    );
  },
};