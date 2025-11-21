import { SchoolApiResponse } from "@/interfaces/common";

export interface CirriculumFramework extends SchoolApiResponse<CirriculumFramework> { }

export interface CirriculumFramework {
    tenNganh: string,
    tenChuyenNganh: string,
    heDaoTao: string,
    loaiHinhDaoTao: string,
    hocKys: HocKy[],
}

export interface HocKy {
    hocKy: number,
    tongSoTC: number,
    soTCBatBuoc: number,
    soTCTuChon: number,
    monBatBuoc: MonHoc[],
    monTuChon: MonHoc[],
}

export interface MonHoc {
    id: number;
    maMonHoc: number;
    maHocPhan: number;
    tenMonHoc: string;
    dvht: number;
    soTinChi: string;
    soTietLyThuyet: number;
    soTietThucHanh: number;
    soNhomTuChon: number;
    soTietTHBT: number;
    soDVHTTuChon: number | null;
    isLyThuyet: boolean;
    isBatBuoc: boolean;
    isDat: boolean;
    hocPhanTruocTienQuyetSongHanh: string;
    hocPhanTruoc: string | null;
    hocPhanTienQuyet: string | null;
    hocPhanSongHanh: string | null;
    maHocPhanTuongDuong: string | null;
}