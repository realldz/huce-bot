
import { BotContext } from '@/interfaces/common';
import { formatSchedule, getCurrentIsoDate } from '@/utils/helpers';
import { ScheduleResponse } from '@/interfaces/sinhvien/schedule';
import schoolApi from '@/api/schoolApi';

export type ScheduleMode = 'today' | 'week' | 'specific';

// Format Date object -> DD/MM/YYYY
export const formatDateStr = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

// Format DD/MM/YYYY -> ISO date string
export const toIsoDate = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}T00:00:00.000`;
};

// Validate và format DD/MM/YYYY -> ISO date string
const formatDate = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  const dayNum: number = parseInt(day, 10);
  const monthNum: number = parseInt(month, 10);
  const yearNum: number = parseInt(year, 10);

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

// Lấy ngày đầu (Thứ 2) và cuối (CN) của tuần chứa baseDate
export const getWeekRange = (baseDate: Date = new Date()): { start: Date; end: Date } => {
  const day = baseDate.getDay() || 7;
  const start = new Date(baseDate);
  start.setDate(baseDate.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

// Xác định mode và các tham số dựa trên args
export const determineScheduleMode = (args: string[]): { mode: ScheduleMode; currentDate?: string; weekStart?: string } => {
  if (args.length === 0) {
    return { mode: 'today' };
  }

  if (args[0].toLowerCase() === 'week') {
    const { start } = getWeekRange(new Date());
    return { mode: 'week', weekStart: formatDateStr(start) };
  }

  if (args.length === 2) {
    return { mode: 'week', weekStart: args[0] };
  }

  const today = formatDateStr(new Date());
  const currentDate = args[0];
  return {
    mode: currentDate === today ? 'today' : 'specific',
    currentDate
  };
};

const getWeekRangeIso = (): { tuNgay: string; denNgay: string } => {
  const { start, end } = getWeekRange();
  return {
    tuNgay: start.toISOString().split('T')[0] + 'T00:00:00.000',
    denNgay: end.toISOString().split('T')[0] + 'T00:00:00.000',
  };
};

export const parseArguments = (args: string[]): { tuNgay: string | null; denNgay: string | null; timeRangeMessage: string } => {
  let tuNgay: string | null = null;
  let denNgay: string | null = null;
  let timeRangeMessage: string = '';

  if (args.length === 0) {
    const todayStr = formatDateStr(new Date());
    timeRangeMessage = `<b>Lịch học hôm nay: (${todayStr})</b>`;
  } else if (args.length === 1 && args[0].toLowerCase() === 'week') {
    const { start, end } = getWeekRange();
    tuNgay = start.toISOString().split('T')[0] + 'T00:00:00.000';
    denNgay = end.toISOString().split('T')[0] + 'T00:00:00.000';
    timeRangeMessage = `<b>Lịch tuần:</b> ${formatDateStr(start)} - ${formatDateStr(end)}`;
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

export const fetchSchedule = async (ctx: BotContext, tuNgay: string | null, denNgay: string | null, timeRangeMessage: string): Promise<Array<string>> => {
  const schedule: ScheduleResponse = await schoolApi.getSchedule(ctx.state.user.token, tuNgay, denNgay);
  const formatted: string = formatSchedule(schedule);

  const MAX_MESSAGE_LENGTH = 4000; // Giới hạn an toàn dưới 4096 ký tự
  let fullMessage = `${timeRangeMessage}\n\n${formatted}`;

  // Nếu tin nhắn ngắn hơn giới hạn, gửi luôn
  if (fullMessage.length <= MAX_MESSAGE_LENGTH) {
    return [fullMessage];
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

  return messages;
};

