import { load } from 'cheerio';
import config from '../config/config';
import { Notice } from '../interfaces/notices';
import { ScheduleData, ScheduleItem } from '../interfaces/schedule';
import { CheckinItem } from '../interfaces/checkin';
import logger from './logger';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { PeriodRange, PeriodRange2 } from '../enums/period';

// Định nghĩa interface cho dữ liệu lịch học từ API

export function formatSchedule(scheduleData: ScheduleData): string {
  const { result } = scheduleData;
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

      const tietHoc = item.tietHocThi;
      const gio = PeriodRange2[item.tietHocThi];
      const tenMonHoc = item.tenMonHoc;
      const phongHoc = item.tenPhong;
      const loaiLich = item.loaiLich === 1
        ? "Lịch học"
        : item.loaiLich === 2
          ? "Lịch thi"
          : item.loaiLich === 3
            ? "Lịch học online"
            : "Không xác định";
      const tamNgung = item.isTamNgung ? " [Nghỉ]" : "";
      const giangVienObj = item.chiTiets.find(
        (detail) => detail.label === "Giảng viên"
      );
      const giangVien = giangVienObj ? giangVienObj.value : "Chưa rõ";

      return (
        `<b>Ngày:</b> ${formattedDate}\n` +
        `<b>Tiết:</b> ${tietHoc}\n` +
        `<b>Giờ:</b> ${gio}\n` +
        `<b>Môn học:</b> ${tenMonHoc}\n` +
        `<b>Phòng:</b> ${phongHoc}\n` +
        `<b>Loại:</b> ${loaiLich}${tamNgung}\n` +
        `<b>Giảng viên:</b> ${giangVien}`
      );
    })
    .join("\n\n");

  return rows;
}

export function parseNewsFromHtml(html: string): { id: string; date: string; title: string; link: string }[] {
  const $ = load(html);
  const newsItems: { id: string; date: string; title: string; link: string }[] = [];

  $('.item-notifi').each((_, element) => {
    const dateRaw = $(element).find('.date-notifi').text().trim().replace(/\s+/g, ' ');
    const [__, month, day] = dateRaw.split(' ');
    const formattedDate = `${day} Tháng ${month}`; // "25 Tháng 02"
    const title = $(element).find('.title-notifi').text().trim();
    const link = $(element).find('.view-more a.view').attr('href');
    const id = $(element).find('.title-notifi').attr('data-post-id') || '';
    const fullLink = link ? `${config.SCHOOL_API_BASEURL}${link}` : '';
    if (id) newsItems.push({ id, date: formattedDate, title, link: fullLink });
  });

  return newsItems;
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
  let buttons = [];

  checkins.map((checkin) => {
    const ngayHoc = new Date(checkin.ngayHoc).toLocaleDateString('vi-VN');
    text += `<b>[${checkin.idLichHoc}] ${checkin.tenMonHoc}</b> (${ngayHoc})\n`;
    checkin.chiTiets.forEach((chiTiet) => {
      text += `<b>${chiTiet.label}:</b> ${chiTiet.value}\n`;
      if (chiTiet.label === 'Tiết') {
        const time = PeriodRange[chiTiet.value];
        text += `<b>Giờ:</b> ${time}\n`;
      }
    });
    text += `\n`;
    buttons.push([{ text: `Điểm danh ${checkin.tenMonHoc}`, callback_data: `checkin_${checkin.idLichHoc}_${checkin.locationTruong}` }]);
  });

  return [text, buttons];
}