import { SchoolApiResponse } from "../common";

export interface GradesResponse extends SchoolApiResponse<GradesSummary> { }

export interface GradeDetailResponse extends SchoolApiResponse<GradeDetail> { }

export interface GradesSummary {
  tongQuans: SummaryItem[];
  tongKetHocKys: HocKy[];
}

export interface GradeDetail {
  rows: GradeDetailRow[];
  htmlKQHT: string;
}

export interface SummaryItem {
  label: string;
  value: string | null;
  size: number | null;
  color: string | null;
  isBold: boolean;
}

export interface HocKy {
  idDot: number;
  tenDot: string;
  datas: SummaryItem[];
  chiTiets: MonHoc[];
}

export interface MonHoc {
  idLopHocPhan: number;
  tenMonHoc: string;
  soTinChi: number;
  diemTrungBinh: number;
}

export interface GradeDetailRow {
  level1: string | null;
  level2: string | null;
  level3: string | null;
  value: string;
  color: string | null;
  size: number | null;
  isBold: boolean;
  isCheck: boolean;
  sttLevel1: number | null;
  sttLevel2: number | null;
  sttLevel3: number | null;
}