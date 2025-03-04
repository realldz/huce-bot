export interface ScheduleResponse {
    result: ScheduleItem[];
  }
  
  export interface ScheduleItem {
    ngay: string;
    tietHocThi: string;
    tenMonHoc: string;
    tenPhong: string;
    loaiLich: number;
    isTamNgung: boolean;
    chiTiets: { label: string; value: string }[];
  }