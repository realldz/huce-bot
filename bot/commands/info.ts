import { BotContext } from '../bot';

// Định nghĩa interface cho dữ liệu từ API getStudentInfo
interface StudentInfoResponse {
  result: {
    hoTen: string;
    hinhAnh: string | null; // Có thể không có ảnh
    chiTiets: { label: string; value: string }[];
  };
}

// Định nghĩa interface cho context với state tùy chỉnh
interface InfoContext extends BotContext {
  state: {
    user: {
      token: string;
    };
  };
}

export default {
  handler: async (ctx: BotContext): Promise<void> => {
    const schoolApi = (await import('../../api/schoolApi')).default; // Sẽ đổi thành .ts sau
    try {
      const studentInfo: StudentInfoResponse = await schoolApi.getStudentInfo(ctx.state.user.token);
      const details: string = studentInfo.result.chiTiets
        .map((detail) => `<b>${detail.label}:</b> <code>${detail.value}</code>`)
        .join('\n');

      const text: string = `Thông tin cá nhân:\n<b>Họ tên:</b> <code>${studentInfo.result.hoTen}</code>\n${details}`;

      if (studentInfo.result.hinhAnh) {
        // Gửi ảnh nếu có
        const photoBuffer: Buffer = Buffer.from(studentInfo.result.hinhAnh, 'base64');
        await ctx.replyWithPhoto(
          { source: photoBuffer },
          {
            caption: text,
            parse_mode: 'HTML',
          }
        );
      } else {
        // Chỉ gửi text nếu không có ảnh
        await ctx.reply(text, { parse_mode: 'HTML' });
      }
    } catch (error) {
      await ctx.reply((error as Error).message || 'Có lỗi khi lấy thông tin sinh viên!');
    }
  },
};