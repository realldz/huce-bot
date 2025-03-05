export interface NewsDetail {
    id: number;
    tieuDe: string;
    noiDung: string;
    soLuotXem: number;
    isBinhLuan: boolean;
    ngayDangTin: string;
    nguoiDangTin: string;
    idDanhMuc: number;
    tenDanhMuc: string;
    lienQuans: string[];
    fileAttachs: string[];
}