export default {
  handler: (ctx) => {
    ctx.reply(
      'Chào mày! Đăng nhập bằng /login <code>mã_sinh_viên</code> <code>mật_khẩu</code> để bắt đầu nhé. Thông tin chỉ dùng để đăng nhập và bot không lưu lại đâu, yên tâm! Sau đó tha hồ xem /schedule hay /notices.',
      { parse_mode: 'HTML' }
    );
  },
};