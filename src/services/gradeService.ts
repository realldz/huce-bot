
import logger from '@/utils/logger';
import { GradeDetailResponse, GradesResponse } from '@/interfaces/sinhvien/grades';
import schoolApi from "@/api/schoolApi";
import { BotContext } from '@/interfaces/common';
import cacheModel from '@/database/cacheModel';
import { InlineKeyboardButton } from '@telegraf/types';
import { formatGradeDetail, formatGradeDetailRow } from '@/utils/helpers/grade';
import { generateGradeExcel } from '@/utils/helpers/excel';

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

export async function sendOverviewMessage(ctx: BotContext, grades: GradesResponse): Promise<string | undefined> {
  const tongQuanText = grades.result?.tongQuans
    .map((item) => `<b>${item.label}:</b> <code>${item.value || 'N/A'}</code>`)
    .join('\n');
  return tongQuanText;
}

export async function sendSemesterSummaryMessage(ctx: any, grades: GradesResponse): Promise<[string | undefined, InlineKeyboardButton[][] | undefined]> {
  const tongKetText = grades.result?.tongKetHocKys
    .map((hk) => `<b>${hk.tenDot}</b>\n${hk.datas.map((d) => `<b>${d.label}:</b> <code>${d.value || 'N/A'}</code>`).join('\n')}`)
    .join('\n\n');
  const buttons: InlineKeyboardButton[][] | undefined = grades.result?.tongKetHocKys.map((hk) => [{ text: hk.tenDot, callback_data: `grade/${hk.idDot}` }]);
  buttons?.push([{ text: 'Xem tất cả', callback_data: 'grade/all' }]);
  return [tongKetText, buttons];
}

export async function handleGradesAction(ctx: BotContext): Promise<[string[], InlineKeyboardButton[][]]> {
  const callbackData = ctx.match?.[1];
  logger.debug('handleGradesAction callbackData:', callbackData);
  const cacheKey = `${ctx.state.user.telegramId}_${ctx.state.user.studentId}_grades`;
  const cachedData = await cacheModel.get<{ grades: GradesResponse }>(cacheKey);
  logger.debug('handleGradesAction cacheKey:', cacheKey);
  const replyText: string[] = [];
  const button: InlineKeyboardButton[][] = [];

  if (!cachedData) {
    logger.warn('Không tìm thấy dữ liệu trong cache');
    replyText.push('Dữ liệu đã hết hạn, thử gửi lại /grades!');
    return [replyText, button];
  }

  if (callbackData === 'all') {
    const tongKetHocKys = cachedData.grades.result?.tongKetHocKys
      .map((hk) => `<b>${hk.tenDot}</b>\n${hk.chiTiets.map((ct) => `<b>${ct.tenMonHoc}</b>: <code>${ct.diemTrungBinh}</code>`).join('\n')}`)
      .join('\n\n') ?? 'Không có dữ liệu';

    replyText.push(tongKetHocKys);

    return [replyText, []];
  } else {
    const hk = cachedData.grades.result?.tongKetHocKys.find((h) => h.idDot.toString() === callbackData);
    if (hk) {
      const chiTiets = hk.chiTiets.map((ct) => [
        { text: `${ct.tenMonHoc} - Chi tiết`, callback_data: `grade/detail/${ct.idLopHocPhan}` },
      ]);
      button.push(...chiTiets);
      const chiTietText = formatGradeDetail(hk.chiTiets);
      replyText.push(`<b>${hk.tenDot}</b>\n${chiTietText}`);
    } else {
      replyText.push('Không tìm thấy dữ liệu');
    }
  }
  return [replyText, button];
}

export async function handleGradeDetailAction(ctx: BotContext): Promise<[string | undefined, string | undefined, number | undefined]> {
  const idLopHocPhan = ctx.match?.[1];
  const cacheKey = `${ctx.state.user.telegramId}_${ctx.state.user.studentId}_grades`;
  logger.debug('handleGradeDetailAction idLopHocPhan:', idLopHocPhan);
  logger.debug('handleGradeDetailAction cacheKey:', cacheKey);
  const cachedData = await cacheModel.get<{ grades: GradesResponse }>(cacheKey);
  if (!cachedData) {
    return [undefined, undefined, undefined];
  }
  const { grades } = cachedData;
  const detail: GradeDetailResponse = await schoolApi.getGradeDetail(ctx.state.user.token, idLopHocPhan);
  const rowsText = formatGradeDetailRow(detail.result?.rows)

  let tenMonHoc = '';
  let idDot = 0;
  grades.result?.tongKetHocKys.forEach((hk) => {

    const mon = hk.chiTiets.find((ct) => ct.idLopHocPhan.toString() === idLopHocPhan);
    if (mon) {
      tenMonHoc = mon.tenMonHoc;
      idDot = hk.idDot;
    }
  });
  return [tenMonHoc, rowsText, idDot];


}

export async function handleGradeExportAction(ctx: BotContext): Promise<[Buffer | null, string]> {
  const cacheKey = `${ctx.state.user.telegramId}_${ctx.state.user.studentId}_grades`;
  const cachedData = await cacheModel.get<{ grades: GradesResponse }>(cacheKey);

  if (!cachedData) {
    return [null, ''];
  }

  const buffer = generateGradeExcel(cachedData.grades);
  const filename = `Bang_diem_${ctx.state.user.studentId}.xlsx`;

  return [buffer, filename];
}
