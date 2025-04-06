export interface GradesResponse {
  result: {
    tongQuans: { label: string; value: string | null }[];
    tongKetHocKys: HocKy[];
  };
}

export interface HocKy {
  idDot: number;
  tenDot: string;
  datas: { label: string; value: string | null }[];
  chiTiets: MonHoc[];
}

export interface MonHoc {
  idLopHocPhan: number;
  tenMonHoc: string;
  soTinChi: number;
  diemTrungBinh: number;
}

export interface GradeDetailResponse {
  result: {
    rows: GradeDetailRow[];
  };
}

export interface GradeDetailRow {
  level1: string | null;
  level2: string | null;
  level3: string;
  value: string;
  isCheck: boolean;
}