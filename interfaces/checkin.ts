import { SchoolApiResponse } from "./common";

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

export interface CheckinResponse {
    errorMessages?: { errorCode: string; errorMessage: string; errorValues: string[] }[];
    isOk: boolean;
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