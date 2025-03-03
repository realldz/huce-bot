export default {
    handler: async (ctx) => {
      const schoolApi = (await import('../../api/schoolApi.js')).default;
      try {
        const studentInfo = await schoolApi.getStudentInfo(ctx.state.user.token);
        const details = studentInfo.result.chiTiets
          .map((detail) => `<b>${detail.label}:</b> <code>${detail.value}</code>`)
          .join('\n');
  
        const text = `Thông tin cá nhân:\n<b>Họ tên:</b> <code>${studentInfo.result.hoTen}</code>\n${details}`;
  
        if (studentInfo.result.hinhAnh) {
          // Gửi ảnh nếu có
          const photoBuffer = Buffer.from(studentInfo.result.hinhAnh, 'base64');
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
        ctx.reply(error.message || 'Có lỗi khi lấy thông tin sinh viên!');
      }
    },
  };