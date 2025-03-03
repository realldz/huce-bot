import { BotContext } from '../bot';
import { formatSchedule } from '../../utils/helpers';
import logger from '../../utils/logger';
import { ScheduleResponse } from '../../types/schedule';

export default {
  handler: async (ctx: BotContext): Promise<void> => {
    const schoolApi = (await import('../../api/schoolApi.js')).default; // Sẽ đổi thành .ts sau
    if (!ctx.from || !ctx.message) {
      logger.error('Không có thông tin người gửi trong context');
      return;
    }
    // Type guard để kiểm tra xem message có text không
    if (!('text' in ctx.message)) {
      logger.error('Message không phải dạng text');
      ctx.reply('Vui lòng gửi lệnh dạng text, ví dụ: /login <mã_sinh_viên> <mật_khẩu>');
      return;
    }
    const args: string[] = ctx.message?.text.split(' ').slice(1); // Lấy tham số sau /schedule

    let tuNgay: string | null = null;
    let denNgay: string | null = null;
    let timeRangeMessage: string = '';

    // Hàm kiểm tra và chuyển định dạng ngày từ DD/MM/YYYY sang YYYY-MM-DDTHH:mm:ss.000
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

    // Hàm lấy ngày đầu và cuối tuần hiện tại
    const getWeekRange = (): { tuNgay: string; denNgay: string } => {
      const today = new Date();
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay())); // Chủ nhật
      const lastDay = new Date(today.setDate(firstDay.getDate() + 6)); // Thứ bảy

      return {
        tuNgay: firstDay.toISOString().split('T')[0] + 'T00:00:00.000',
        denNgay: lastDay.toISOString().split('T')[0] + 'T00:00:00.000',
      };
    };

    try {
      if (args.length === 0) {
        // /schedule: Lấy lịch hôm nay
        const today: string = new Date().toISOString().split('T')[0];
        timeRangeMessage = `<b>Ngày:</b> ${today.split('-')[2]}/${today.split('-')[1]}`;
      } else if (args.length === 1 && args[0].toLowerCase() === 'week') {
        // /schedule week: Lấy lịch tuần này
        const { tuNgay: weekStart, denNgay: weekEnd } = getWeekRange();
        tuNgay = weekStart;
        denNgay = weekEnd;
        timeRangeMessage = `<b>Khoảng thời gian:</b> ${weekStart.split('T')[0].split('-')[2]}/${weekStart.split('T')[0].split('-')[1]} - ${weekEnd.split('T')[0].split('-')[2]}/${weekEnd.split('T')[0].split('-')[1]}`;
      } else if (args.length === 1) {
        // /schedule 31/12/2025: Lấy lịch 1 ngày
        tuNgay = formatDate(args[0]);
        denNgay = tuNgay;
        timeRangeMessage = `<b>Ngày:</b> ${args[0]}`;
      } else if (args.length === 2) {
        // /schedule 01/12/2025 31/12/2025: Lấy lịch khoảng thời gian
        tuNgay = formatDate(args[0]);
        denNgay = formatDate(args[1]);
        if (new Date(tuNgay) > new Date(denNgay)) {
          throw new Error('Ngày bắt đầu phải trước ngày kết thúc!');
        }
        timeRangeMessage = `<b>Khoảng thời gian:</b> ${args[0]} - ${args[1]}`;
      } else {
        ctx.reply('Sai cú pháp! Dùng: /schedule hoặc /schedule week hoặc /schedule DD/MM/YYYY hoặc /schedule DD/MM/YYYY DD/MM/YYYY');
        return ;
      }

      const schedule: ScheduleResponse = await schoolApi.getSchedule(ctx.state.user.token, tuNgay, denNgay);
      const formatted: string = formatSchedule(schedule);
      ctx.reply(`${timeRangeMessage}\n\n${formatted}`, { parse_mode: 'HTML' });
    } catch (error) {
      ctx.reply((error as Error).message || 'Có lỗi khi lấy lịch học!');
    }
  },
};