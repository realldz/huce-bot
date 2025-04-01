import { BotContext } from '../bot';
import { formatSchedule, getCurrentIsoDate } from '../../utils/helpers';
import logger from '../../utils/logger';
import { ScheduleResponse } from '../../interfaces/schedule';
import schoolApi from '../../api/schoolApi';

const formatDate = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  const dayNum: number = parseInt(day, 10);
  const monthNum: number = parseInt(month, 10);
  const yearNum: number = parseInt(year, 10);

  // Kiểm tra ngày hợp lệ
  if (
    isNaN(dayNum) ||
    isNaN(monthNum) ||
    isNaN(yearNum) ||
    dayNum < 1 ||
    dayNum > 31 ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 2000
  ) {
    throw new Error('Ngày không hợp lệ! Dùng định dạng DD/MM/YYYY.');
  }

  const date = new Date(yearNum, monthNum - 1, dayNum);
  if (date.getMonth() + 1 !== monthNum || date.getDate() !== dayNum) {
    throw new Error('Ngày không tồn tại! Kiểm tra lại DD/MM/YYYY.');
  }

  return `${yearNum}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000`;
};

const getWeekRange = (): { tuNgay: string; denNgay: string } => {
  const today = getCurrentIsoDate();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay())); // Chủ nhật
  const lastDay = new Date(today.setDate(firstDay.getDate() + 6)); // Thứ bảy

  return {
    tuNgay: firstDay.toISOString().split('T')[0] + 'T00:00:00.000',
    denNgay: lastDay.toISOString().split('T')[0] + 'T00:00:00.000',
  };
};

const parseArguments = (args: string[]): { tuNgay: string | null; denNgay: string | null; timeRangeMessage: string } => {
  let tuNgay: string | null = null;
  let denNgay: string | null = null;
  let timeRangeMessage: string = '';

  if (args.length === 0) {
    const today: string = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    timeRangeMessage = `<b>Lịch học hôm nay: (${today.split('-')[2]}/${today.split('-')[1]})</b>`;
  } else if (args.length === 1 && args[0].toLowerCase() === 'week') {
    const { tuNgay: weekStart, denNgay: weekEnd } = getWeekRange();
    tuNgay = weekStart;
    denNgay = weekEnd;
    timeRangeMessage = `<b>Khoảng thời gian:</b> ${weekStart.split('T')[0].split('-')[2]}/${weekStart.split('T')[0].split('-')[1]} - ${weekEnd.split('T')[0].split('-')[2]}/${weekEnd.split('T')[0].split('-')[1]}`;
  } else if (args.length === 1) {
    tuNgay = formatDate(args[0]);
    denNgay = tuNgay;
    timeRangeMessage = `<b>Ngày:</b> ${args[0]}`;
  } else if (args.length === 2) {
    tuNgay = formatDate(args[0]);
    denNgay = formatDate(args[1]);
    if (new Date(tuNgay) > new Date(denNgay)) {
      throw new Error('Ngày bắt đầu phải trước ngày kết thúc!');
    }
    if (new Date(denNgay).getTime() - new Date(tuNgay).getTime() > 31 * 24 * 60 * 60 * 1000) {
      throw new Error('Khoảng thời gian không được quá 31 ngày!');
    }
    timeRangeMessage = `<b>Khoảng thời gian:</b> ${args[0]} - ${args[1]}`;
  } else {
    throw new Error('Sai cú pháp! Dùng: /schedule hoặc /schedule week hoặc /schedule DD/MM/YYYY hoặc /schedule DD/MM/YYYY DD/MM/YYYY');
  }

  return { tuNgay, denNgay, timeRangeMessage };
};

const fetchAndReplySchedule = async (ctx: BotContext, tuNgay: string | null, denNgay: string | null, timeRangeMessage: string): Promise<void> => {
  const schedule: ScheduleResponse = await schoolApi.getSchedule(ctx.state.user.token, tuNgay, denNgay);
  const formatted: string = formatSchedule(schedule);

  const MAX_MESSAGE_LENGTH = 4000; // Giới hạn an toàn dưới 4096 ký tự
  let fullMessage = `${timeRangeMessage}\n\n${formatted}`;

  // Nếu tin nhắn ngắn hơn giới hạn, gửi luôn
  if (fullMessage.length <= MAX_MESSAGE_LENGTH) {
    await ctx.reply(fullMessage, { parse_mode: 'HTML' });
    return;
  }
  fullMessage += '\n\n<i><b>Tin nhắn đã được chia nhỏ do quá dài</b></i>'; // Thêm thông báo vào cuối tin nhắn

  // Tách tin nhắn thành nhiều phần
  const messages: string[] = [];
  let currentMessage = '';
  const lines = fullMessage.split('\n'); // Tách thành từng dòng

  for (const line of lines) {
    // Nếu thêm dòng mới vượt quá giới hạn
    if ((currentMessage + line + '\n').length > MAX_MESSAGE_LENGTH) {
      if (currentMessage) {
        messages.push(currentMessage.trim()); // Thêm tin nhắn hiện tại vào danh sách
      }
      currentMessage = line; // Bắt đầu tin nhắn mới với dòng hiện tại
    } else {
      currentMessage += line + '\n'; // Thêm dòng vào tin nhắn hiện tại
    }
  }

  // Đừng quên thêm phần còn lại nếu có
  if (currentMessage.trim()) {
    messages.push(currentMessage.trim());
  }

  // Gửi từng tin nhắn
  for (const msg of messages) {
    await ctx.reply(msg, { parse_mode: 'HTML' });
  }
};

export default {
  handler: async (ctx: BotContext): Promise<void> => {
    if (!ctx.from || !ctx.message) {
      logger.error('Không có thông tin người gửi trong context');
      return;
    }
    if (!('text' in ctx.message)) {
      logger.error('Message không phải dạng text');
      ctx.reply('Vui lòng gửi lệnh dạng text, ví dụ: /login <mã_sinh_viên> <mật_khẩu>');
      return;
    }

    const args: string[] = ctx.message?.text.split(' ').slice(1);

    try {
      const { tuNgay, denNgay, timeRangeMessage } = parseArguments(args);
      await fetchAndReplySchedule(ctx, tuNgay, denNgay, timeRangeMessage);
    } catch (error) {
      ctx.reply((error as Error).message || 'Có lỗi khi lấy lịch học!');
    }
  },
};