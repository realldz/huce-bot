import logger from '../../utils/logger.js';

const gradesCache = new Map();

export default {
  handler: (bot) => async (ctx) => {
    logger.info('Bắt đầu xử lý lệnh /grades');
    const schoolApi = (await import('../../api/schoolApi.js')).default;

    try {
      logger.info('Gọi API getGrades');
      const grades = await schoolApi.getGrades(ctx.state.user.token, ctx.state.user.idSinhVien);
      logger.info('API getGrades trả về thành công');

      const userToken = ctx.state.user.token;
      const userIdSinhVien = ctx.state.user.idSinhVien;

      // 1. Tin nhắn tổng quan (tongQuans)
      const tongQuanText = grades.result.tongQuans
        .map((item) => `<b>${item.label}:</b> <code>${item.value || 'N/A'}</code>`)
        .join('\n');
      logger.info('Gửi tin nhắn tổng quan');
      await ctx.reply(`<b>Tổng quan kết quả học tập:</b>\n${tongQuanText}`, { parse_mode: 'HTML' });

      // 2. Tin nhắn tổng kết học kỳ (tongKetHocKys)
      const tongKetText = grades.result.tongKetHocKys
        .map((hk) => {
          const datas = hk.datas
            .map((data) => `<b>${data.label}:</b> <code>${data.value || 'N/A'}</code>`)
            .join('\n');
          return `<b>${hk.tenDot}</b>\n${datas}`;
        })
        .join('\n\n');
      const buttons = grades.result.tongKetHocKys.map((hk) => [
        { text: hk.tenDot, callback_data: `grades_${hk.idDot}` },
      ]);
      buttons.push([{ text: 'Xem tất cả', callback_data: 'grades_all' }]);

      logger.info('Gửi tin nhắn tổng kết học kỳ với nút');
      const message = await ctx.reply(
        `<b>Tổng kết học kỳ:</b>\n${tongKetText}\n\nChọn học kỳ để xem chi tiết:`,
        {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: buttons },
        }
      );

      const cacheKey = `${ctx.chat.id}_${message.message_id}`;
      logger.info(`Lưu cache với key: ${cacheKey}`);
      gradesCache.set(cacheKey, { grades, token: userToken, idSinhVien: userIdSinhVien });
      setTimeout(() => {
        logger.info(`Xóa cache với key: ${cacheKey}`);
        gradesCache.delete(cacheKey);
      }, 60 * 60 * 1000);

      // 3. Xử lý callback từ nút học kỳ
      bot.action(/grades_(.+)/, async (ctx) => {
        logger.info(`Nhận callback: ${ctx.match[1]}`);
        const callbackData = ctx.match[1];
        const replyText = [];

        const cacheKey = `${ctx.chat.id}_${ctx.update.callback_query.message.message_id}`;
        logger.info(`Tìm cache với key trong grades: ${cacheKey}`);
        const cachedData = gradesCache.get(cacheKey);
        if (!cachedData) {
          logger.error('Không tìm thấy dữ liệu trong cache cho grades');
          await ctx.reply('Dữ liệu đã hết hạn, thử gửi lại /grades!');
          await ctx.answerCbQuery();
          return;
        }

        const { grades } = cachedData;

        if (callbackData === 'all') {
          grades.result.tongKetHocKys.forEach((hk) => {
            const chiTietText = hk.chiTiets
              .map((ct) => `<b>${ct.tenMonHoc}</b> (${ct.soTinChi} TC): <code>${ct.diemTrungBinh}</code>`)
              .join('\n');
            replyText.push(`<b>${hk.tenDot}</b>\n${chiTietText}`);
          });
          await ctx.reply(replyText.join('\n\n'), { parse_mode: 'HTML' });
        } else {
          const hk = grades.result.tongKetHocKys.find((h) => h.idDot.toString() === callbackData);
          if (hk) {
            const buttons = hk.chiTiets.map((ct) => [
              { text: `${ct.tenMonHoc} - Chi tiết`, callback_data: `grade_${ct.idLopHocPhan}|${cacheKey}` },
            ]);
            const chiTietText = hk.chiTiets
              .map((ct) => `<b>${ct.tenMonHoc}</b> (${ct.soTinChi} TC): <code>${ct.diemTrungBinh}</code>`)
              .join('\n');
            replyText.push(`<b>${hk.tenDot}</b>\n${chiTietText}`);
            await ctx.reply(
              replyText.join('\n\n'),
              {
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: buttons },
              }
            );
          }
        }
        await ctx.answerCbQuery();
      });

      // 4. Xử lý callback chi tiết môn học
      bot.action(/grade_([^|]+)\|(.+)/, async (ctx) => {
        const [idLopHocPhan, cacheKey] = [ctx.match[1], ctx.match[2]];
        logger.info(`Nhận callback chi tiết môn: ${idLopHocPhan}`);
        logger.info(`Tìm cache với key trong grade: ${cacheKey}`);
        try {
          const cachedData = gradesCache.get(cacheKey);
          if (!cachedData) {
            logger.error('Không tìm thấy dữ liệu trong cache cho grade');
            await ctx.reply('Dữ liệu đã hết hạn, thử gửi lại /grades!');
            await ctx.answerCbQuery();
            return;
          }

          const { token, idSinhVien, grades } = cachedData;
          const detail = await schoolApi.getGradeDetail(token, idSinhVien, idLopHocPhan);
          const rowsText = detail.result.rows
            .filter((row) => row.level3 && row.value !== null)
            .map((row) => {
              let label = row.level3.replace(/\\n/g, ' ');
              if (row.level2) {
                const level2Clean = row.level2.replace(/\\n/g, ' ').trim();
                if (level2Clean === 'ĐQT 30%') label = 'Điểm quá trình 30%';
                else if (level2Clean === 'ĐQT 25%') label = 'Điểm quá trình 25%';
                else if (level2Clean === 'ĐKT') label = `Điểm kết thúc ${row.level3}`; // Sửa từ "Điểm kiểm tra" thành "Điểm kết thúc"
                else if (level2Clean === 'Được dự thi') label = 'Được dự thi';
                else if (level2Clean === 'Điểm tổng kết') label = 'Điểm tổng kết';
                else label = `${level2Clean} ${row.level3}`.trim();
              }
              const value = row.isCheck ? (row.value === '1' ? '✅' : '❌') : row.value;
              return `<b>${label}:</b> <code>${value}</code>`;
            })
            .join('\n');

          let tenMonHoc = 'Không xác định';
          grades.result.tongKetHocKys.forEach((hk) => {
            const mon = hk.chiTiets.find((ct) => ct.idLopHocPhan.toString() === idLopHocPhan);
            if (mon) tenMonHoc = mon.tenMonHoc;
          });

          await ctx.reply(
            `<b>Chi tiết điểm - ${tenMonHoc}</b>\n${rowsText}`,
            { parse_mode: 'HTML' }
          );
        } catch (error) {
          logger.error(`Lỗi khi lấy chi tiết môn: ${error.message}`);
          await ctx.reply('Có lỗi khi lấy chi tiết điểm môn học!');
        }
        await ctx.answerCbQuery();
      });
    } catch (error) {
      logger.error(`Lỗi khi xử lý /grades: ${error.message}`);
      ctx.reply(error.message || 'Có lỗi khi lấy kết quả học tập!');
    }
  },
};