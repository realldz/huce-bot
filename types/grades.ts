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