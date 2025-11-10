import { SchoolApiResponse } from "../common";

export interface BankReponse extends SchoolApiResponse<BankResult[]> { }

export interface BankResult {
    loaiHinhThanhToan: number,
    tenLoaiHinhThanhToan: string,
    sttLoaiHinhThanhToan: number,
    banks: Bank[]
}
export interface Bank {
    id: number;
    maNganHang: string;
    tenNganHang: string;
    bankLogoUrl: string;
    isTrungGianTT: number | null;
    tmnCode: string | null;
    thongBao: string | null;
    phiDV: number;
    phiDVPhanTram: number | null;
    stt: number | null;
    ghiChu: string | null;
    metaData: string;
    strRequest01: string | null;
    strRequest02: string | null;
    strRequest03: string | null;
    idLoaiHinhThanhToan: number;
    tenLoaiHinhThanhToan: string | null;
    sttLoaiHinhThanhToan: number | null;
}
