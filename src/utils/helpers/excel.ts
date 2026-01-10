import * as XLSX from 'xlsx';
import { GradesResponse } from '@/interfaces/sinhvien/grades';

export function generateGradeExcel(grades: GradesResponse): Buffer {
    const wb = XLSX.utils.book_new();

    // 1. Sheet Tổng quan
    const tongQuanData = grades.result?.tongQuans.map(item => ({
        'Thông tin': item.label,
        'Giá trị': item.value
    })) || [];

    if (grades.result?.tongKetHocKys) {
        grades.result.tongKetHocKys.forEach(hk => {
            hk.datas.forEach(d => {
                tongQuanData.push({
                    'Thông tin': `${hk.tenDot} - ${d.label}`,
                    'Giá trị': d.value
                })
            })
        })
    }

    const wsTongQuan = XLSX.utils.json_to_sheet(tongQuanData);
    XLSX.utils.book_append_sheet(wb, wsTongQuan, "Tổng quan");

    // 2. Sheet Chi tiết
    const chiTietData: any[] = [];

    grades.result?.tongKetHocKys.forEach(hk => {
        if (hk.chiTiets && hk.chiTiets.length > 0) {
            hk.chiTiets.forEach(mon => {
                chiTietData.push({
                    'Học kỳ': hk.tenDot,
                    'Môn học': mon.tenMonHoc,
                    'Số tín chỉ': mon.soTinChi,
                    'Điểm trung bình': mon.diemTrungBinh
                });
            });
        }
    });

    const wsChiTiet = XLSX.utils.json_to_sheet(chiTietData);

    // Set column widths for readability
    const wscols = [
        { wch: 20 }, // Học kỳ
        { wch: 40 }, // Môn học
        { wch: 10 }, // Số tín chỉ
        { wch: 15 }, // Điểm trung bình
    ];
    wsChiTiet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, wsChiTiet, "Chi tiết điểm");

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
