
import logger from '@/utils/logger';
import { GradeDetailResponse, GradesResponse } from '@/interfaces/sinhvien/grades';
import schoolApi from "@/api/schoolApi";
import { BotContext } from '@/interfaces/common';
import cacheModel from '@/database/cacheModel';

export async function fetchGradesAndCache(ctx: BotContext) {
  const user = ctx.state.user;
  if (!user) {
    logger.error('Không có thông tin user');
    await ctx.reply('Có lỗi xử lý yêu cầu, thử lại sau!');
    return null;
  }

  logger.debug('Gọi API getGrades');
  const grades = await schoolApi.getGrades(user.token);
  logger.debug('API getGrades trả về thành công');

  if (ctx.chat) {
    const cacheKey = `${ctx.chat.id}_${ctx.state.studentId}_grades`;
    await cacheModel.set(cacheKey, { grades }, 600);
    logger.debug('Lưu dữ liệu vào cache:', cacheKey);
  }

  return grades;
}

export async function sendOverviewMessage(ctx: any, grades: GradesResponse) {
  const tongQuanText = grades.result.tongQuans
    .map((item) => `<b>${item.label}:</b> <code>${item.value || 'N/A'}</code>`)
    .join('\n');
  await ctx.reply(`<b>Tổng quan kết quả học tập:</b>\n${tongQuanText}`, { parse_mode: 'HTML' });
}

export async function sendSemesterSummaryMessage(ctx: any, grades: GradesResponse) {
  const tongKetText = grades.result.tongKetHocKys
    .map((hk) => `<b>${hk.tenDot}</b>\n${hk.datas.map((d) => `<b>${d.label}:</b> <code>${d.value || 'N/A'}</code>`).join('\n')}`)
    .join('\n\n');
  const buttons = grades.result.tongKetHocKys.map((hk) => [{ text: hk.tenDot, callback_data: `grades_${hk.idDot}` }]);
  buttons.push([{ text: 'Xem tất cả', callback_data: 'grades_all' }]);

  await ctx.reply(`<b>Tổng kết học kỳ:</b>\n${tongKetText}\n\nChọn học kỳ để xem chi tiết:`, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function handleGradesAction(ctx: any) {
  const callbackData = ctx.match[1];
  logger.debug('handleGradesAction callbackData:', callbackData);
  const cacheKey = `${ctx.chat.id}_${ctx.state.user.studentId}_grades`;
  const cachedData = await cacheModel.get<{ grades: GradesResponse }>(cacheKey);
  logger.debug('handleGradesAction cacheKey:', cacheKey);

  if (!cachedData) {
    logger.warn('Không tìm thấy dữ liệu trong cache');
    await ctx.reply('Dữ liệu đã hết hạn, thử gửi lại /grades!');
    return;
  }

  if (callbackData === 'all') {
    const replyText = cachedData.grades.result.tongKetHocKys
      .map((hk) => `<b>${hk.tenDot}</b>\n${hk.chiTiets.map((ct) => `<b>${ct.tenMonHoc}</b>: <code>${ct.diemTrungBinh}</code>`).join('\n')}`)
      .join('\n\n');
    await ctx.reply(replyText, { parse_mode: 'HTML' });
  } else {
    const hk = cachedData.grades.result.tongKetHocKys.find((h) => h.idDot.toString() === callbackData);
    const replyText = [];
    if (hk) {
      const buttons = hk.chiTiets.map((ct) => [
        { text: `${ct.tenMonHoc} - Chi tiết`, callback_data: `gradeDetail_${ct.idLopHocPhan}|${cacheKey}` },
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
}

export async function handleGradeDetailAction(ctx: any) {
  const [idLopHocPhan, cacheKey] = [ctx.match[1], ctx.match[2]];
  logger.debug('handleGradeDetailAction idLopHocPhan:', idLopHocPhan);
  logger.debug('handleGradeDetailAction cacheKey:', cacheKey);
  const cachedData = await cacheModel.get<{ grades: GradesResponse }>(cacheKey);
  if (!cachedData) {
    await ctx.reply('Dữ liệu đã hết hạn, thử gửi lại /grades!');
    return;
  }
  const { grades } = cachedData;
  const detail: GradeDetailResponse = await schoolApi.getGradeDetail(ctx.state.user.token, idLopHocPhan);
  const rowsText = detail.result.rows
    .filter((row) => row.level3 && row.value !== null)
    .map((row) => {
      let label = row.level3.replace(/\n/g, ' ');
      if (row.level2) {
        const level2Clean = row.level2.replace(/\n/g, ' ').trim();
        if (level2Clean === 'ĐQT 30%') label = 'Điểm quá trình 30%';
        else if (level2Clean === 'ĐQT 25%') label = 'Điểm quá trình 25%';
        else if (level2Clean === 'ĐKT') label = `Điểm kết thúc ${row.level3}`;
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

  await ctx.reply(`<b>Chi tiết điểm:</b> ${tenMonHoc}\n${rowsText}`, { parse_mode: 'HTML' });
  await ctx.answerCbQuery();
}
