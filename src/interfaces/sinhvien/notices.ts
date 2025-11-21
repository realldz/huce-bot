import { SchoolApiResponse } from "@/interfaces/common";

export interface NoticeResponse extends SchoolApiResponse<Notice[]> { }

export interface Notice {
  typeNotify: number;
  id: number;
  idMap: number;
  tieuDe: string;
  moTa: string;
  noiDung: string;
  ngayTao: string;
  isDaXem: boolean;
}
