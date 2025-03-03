export function formatSchedule(scheduleData) {
  const { result } = scheduleData;
  if (!result || result.length === 0) {
    return "Không có lịch học/thi trong khoảng thời gian này.";
  }

  const rows = result
    .map((item) => {
      const date = new Date(item.ngay);
      const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const dayOfWeek = weekdays[date.getDay()];
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const formattedDate = `${dayOfWeek}, ${day}/${month}`;

      const tietHoc = item.tietHocThi;
      const tenMonHoc = item.tenMonHoc;
      const phongHoc = item.tenPhong;
      const loaiLich = item.loaiLich === 1 ? "Lịch học" : "Lịch thi";
      const tamNgung = item.isTamNgung ? " [Nghỉ]" : ""; // Thêm [Nghỉ] nếu true
      const giangVienObj = item.chiTiets.find(
        (detail) => detail.label === "Giảng viên"
      );
      const giangVien = giangVienObj ? giangVienObj.value : "Chưa rõ";

      return (
        `<b>Ngày:</b> ${formattedDate}\n` +
        `<b>Tiết:</b> ${tietHoc}\n` +
        `<b>Môn học:</b> ${tenMonHoc}\n` +
        `<b>Phòng:</b> ${phongHoc}\n` +
        `<b>Loại:</b> ${loaiLich}${tamNgung}\n` + // Thêm tamNgung vào đây
        `<b>Giảng viên:</b> ${giangVien}`
      );
    })
    .join("\n\n");

  return rows;
}
export function formatNotices(notices) {
  return notices
    .map((notice) => `📢 ${notice.title}\n${notice.content}`)
    .join("\n\n");
}
