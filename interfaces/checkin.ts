export interface ListCheckinResponse {
    result: CheckinItem[] | null;
    errorMessages: [],
    isOk: boolean;
}

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
    idSinhVien?: string,
    deviceOSID: string,
    idLichHoc: string;
    code: string;
    location: string;
    ipAddress: string;
    viTri: string;
    isCanhBao: boolean;
}