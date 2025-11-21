import { SchoolApiResponse } from "@/interfaces/common";

export interface ListCheckinResponse extends SchoolApiResponse<CheckinItem[]> { }
export interface CheckinResponse extends SchoolApiResponse<CheckinItem> { }

export interface CheckinItem {
    id: number;
    idLichHoc: number;
    tenMonHoc: string;
    ngayHoc: string;
    banKinhTruong: number;
    locationTruong: string;
    isDaDiemDanh: boolean;
    chiTiets: { label: string; value: string }[];
    metaData: any;
}

export interface CheckinRequest {
    idSinhVien?: number,
    deviceOSID: string,
    idLichHoc: number,
    code: string;
    location: string;
    ipAddress: string;
    viTri: string;
    isCanhBao: boolean;
}