import { SchoolApiResponse } from "@/interfaces/common";

export interface StudentInfoResponse extends SchoolApiResponse<StudentInfo> { }

export interface StudentInfo {
  idSinhVien: number;
  maSinhVien: string;
  hoTen: string;
  hinhAnh: string;
  chiTiets: StudentInfoDetail[];
}

export interface StudentInfoDetail {
  label: string;
  value: string;
  isBold: boolean;
  colorValue: string | null;
}