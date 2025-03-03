import { formatSchedule } from '../../utils/helpers.js';

export default {
  handler: async (ctx) => {
    const schoolApi = (await import('../../api/schoolApi.js')).default;
    const args = ctx.message.text.split(' ').slice(1); // Lấy tham số sau /schedule

    let tuNgay = null;
    let denNgay = null;
    let timeRangeMessage = '';

    // Hàm kiểm tra và chuyển định dạng ngày từ DD/MM/YYYY sang YYYY-MM-DDTHH:mm:ss.000
    const formatDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      // Kiểm tra ngày hợp lệ
      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) ||
          dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2000) {
        throw new Error('Ngày không hợp lệ! Dùng định dạng DD/MM/YYYY.');
      }

      const date = new Date(yearNum, monthNum - 1, dayNum);
      if (date.getMonth() + 1 !== monthNum || date.getDate() !== dayNum) {
        throw new Error('Ngày không tồn tại! Kiểm tra lại DD/MM/YYYY.');
      }

      return `${yearNum}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000`;
    };

    // Hàm lấy ngày đầu và cuối tuần hiện tại
    const getWeekRange = () => {
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
        const today = new Date().toISOString().split('T')[0];
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
        return ctx.reply('Sai cú pháp! Dùng: /schedule hoặc /schedule week hoặc /schedule DD/MM/YYYY hoặc /schedule DD/MM/YYYY DD/MM/YYYY');
      }

      const schedule = await schoolApi.getSchedule(ctx.state.user.token, tuNgay, denNgay);
      const formatted = formatSchedule(schedule);
      ctx.reply(`${timeRangeMessage}\n\n${formatted}`, { parse_mode: 'HTML' });
    } catch (error) {
      ctx.reply(error.message || 'Có lỗi khi lấy lịch học!');
    }
  }
};