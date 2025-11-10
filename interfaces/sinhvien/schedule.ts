import { SchoolApiResponse } from "../common";

export interface ScheduleResponse extends SchoolApiResponse<ScheduleItem[]> { }

export interface ScheduleItemDetail {
  label: string;
  value: string;
}
export interface ScheduleItem {
  loaiLich: number;
  id: number;
  idLopHocPhan: number;
  ngay: string;
  tenMonHoc: string;
  tietHocThi: string;
  tenPhong: string;
  isLichHoc: boolean;
  isTamNgung: boolean;
  isElearning: boolean;
  linkOnline: string | null;
  linkOnline1: string | null;
  linkOnline2: string | null;
  chiTiets: ScheduleItemDetail[];
  metaData: any;
}

