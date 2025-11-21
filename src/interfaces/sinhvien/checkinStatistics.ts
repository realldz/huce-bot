import { SchoolApiResponse } from "@/interfaces/common";

export interface CheckinStatisticsResponse extends SchoolApiResponse<CheckinStatistics[]> { }

export interface CheckinStatistics {
    idDot: number,
    tenDot: string,
    namHoc: number,
    sttDot: number,
    tongCoPhep: number,
    tongKoPhep: number,
    tongSoTinChi: number,
    monHocs: Subject[],
}

export interface Subject {
    id: number,
    maLopHocPhan: number,
    maMonHoc: number,
    tenMonHoc: string,
    soTinChi: number,
    coPhep: number,
    koPhep: number,
    stCoPhep: number,
    stKoPhep: number,
    soLanKiemTraDat: number,
    soLanKiemTraKoDat: number
}