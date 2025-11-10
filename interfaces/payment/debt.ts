import { SchoolApiResponse } from "@/interfaces/common";

export interface DebtResponse extends SchoolApiResponse<DebtResult> { }

export interface DebtResult {
    congNos: Debt[];
    configs: Configs[];
    tinhChatHoaDon: any[];
}

export interface Debt {
    id: number;
    strId: string;
    subId: number;
    strSubId: string;
    ma: string;
    noiDungThu: string;
    soTienNop: number;
    soTienVAT: number;
    isBatBuoc: boolean;
    idDot: number;
    idNamHoc: number;
    metaData: string;
    strRequest01: string | null;
    strRequest02: string | null;
    strRequest03: string | null;
    chiTiets: ChiTiet[];
    idLoaiThu: number;
    idDangKyHocPhan: number | null;
    idDuKienThu: number | null;
    idKeHoachThuChung: number | null;
    idDangKyThiLai: number | null;
    idDangKyThiTotNghiep: number | null;
    idCongNoNoiTru: number | null;
    soLuong: number | null;
    strIDCongNo: string | null;
    idLoaiMonHoc: number;
    idKhoanThuKhac: number | null;
    idTrangThaiDangKy: number;
    ngayHetHanNopHP: string | null;
}

export interface ChiTiet {
    label: string;
    value: string | number;
}

export interface Configs {
    key: string;
    value: string;
    ghiChuForDev: string;
}
