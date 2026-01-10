import { Notice } from '@/interfaces/sinhvien/notices';
import { ScheduleItem, ScheduleResponse } from '@/interfaces/sinhvien/schedule';
import { CheckinItem } from '@/interfaces/sinhvien/checkin';
import { InlineKeyboardButton } from '@telegraf/types';
import { PeriodRange, PeriodRange2 } from '@/enums/period';
import { ScheduleTypeEnum } from '@/enums/schedule';

// Định nghĩa interface cho dữ liệu lịch học từ API

export function formatSchedule(scheduleResponse: ScheduleResponse): string {
  const { result } = scheduleResponse;
  if (!result || result.length === 0) {
    return "Không có lịch học/thi trong khoảng thời gian này.";
  }

  const rows = result
    .map((item: ScheduleItem) => {
      const date = new Date(item.ngay);
      const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const dayOfWeek = weekdays[date.getDay()];
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const formattedDate = `${dayOfWeek}, ${day}/${month}`;

      const tenMonHoc = item.tenMonHoc;
      const loaiLich = ScheduleTypeEnum[item.loaiLich]
      const linkOnlines = [
        item.linkOnline ? `<a href="${item.linkOnline}">Link online 1</a>` : null,
        item.linkOnline1 ? `<a href="${item.linkOnline1}">Link online 2</a>` : null,
        item.linkOnline2 ? `<a href="${item.linkOnline2}">Link online 3</a>` : null,
      ].filter(Boolean).join(' ');
      const tamNgung = item.isTamNgung ? " [Nghỉ]" : "";
      const details = item.chiTiets
        .filter((detail) => detail.value)
        .map((detail) => `<b>${detail.label}</b>: ${detail.value}`)
        .join('\n');


      return (
        `<b>Ngày:</b> ${formattedDate}\n` +
        `<b>Loại:</b> ${loaiLich}${tamNgung}\n` +
        `<b>Môn học:</b> ${tenMonHoc}\n` +
        details + (linkOnlines ? `\n<b>Link online:</b> ${linkOnlines}` : "")
      );
    })
    .join("\n\n");

  return rows;
}

export function getCurrentIsoDate(): Date {
  return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
}

export function formatNotices(notices: Notice[]): string {
  if (!notices || notices.length === 0) {
    return "Không có nhắc nhở nào!";
  }

  return notices
    .map((notice) =>
      `<b>${notice.tieuDe}</b>\n${notice.moTa}\n` +
      `<i>Ngày tạo: ${new Date(notice.ngayTao).toLocaleDateString('vi-VN')}</i>`
    )
    .join("\n\n");
}

export function formatListCheckin(checkins: CheckinItem[]): [string, InlineKeyboardButton[][]] {
  if (!checkins || checkins.length === 0) {
    return ["Không có lịch học để điểm danh!", []];
  }

  let text = '';
  let buttons: InlineKeyboardButton[][] = [];

  checkins.map((checkin) => {
    const ngayHoc = new Date(checkin.ngayHoc).toLocaleDateString('vi-VN');
    text += `<b>[${checkin.idLichHoc}] ${checkin.isDaDiemDanh ? '[Đã điểm danh]' : ''}${checkin.tenMonHoc}</b> (${ngayHoc})\n`;
    checkin.chiTiets.forEach((chiTiet) => {
      text += `<b>${chiTiet.label}:</b> ${chiTiet.value}\n`;
      if (chiTiet.label === 'Tiết') {
        const time = PeriodRange[chiTiet.value as keyof typeof PeriodRange];
        text += `<b>Giờ:</b> ${time}\n`;
      }
    });
    text += `\n`;
    buttons.push([{ text: `Điểm danh ${checkin.tenMonHoc}`, callback_data: `checkin_${checkin.idLichHoc}_${checkin.locationTruong}` }]);
  });

  return [text, buttons];
}
