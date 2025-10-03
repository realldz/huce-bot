import { SchoolApiResponse } from "./common";

export interface NewsResponse extends SchoolApiResponse<News[]> { }
export interface NewsCategoryResponse extends SchoolApiResponse<NewsCategory[]> { }
export interface NewsDetailResponse extends SchoolApiResponse<NewsDetail> { }

export interface News {
  id: number;
  tieuDe: string;
  tomTat: string;
  hinhDaiDien: string;
  soThuTu: number;
  ngayDangTin: string;
  nguoiDangTin: string;
  idDanhMuc: number;
  tenDanhMuc: string;
}

export interface NewsCategory {
  id: number;
  tenDanhMucTinTuc: string;
  soThuTu: number;
  ghiChu: string;
}

export interface NewsDetail {
  id: number;
  tieuDe: string;
  noiDung: string;
  soLuotXem: number;
  isBinhLuan: boolean;
  ngayDangTin: string;
  nguoiDangTin: string;
  idDanhMuc: number;
  tenDanhMuc: string;
  lienQuans: string[];
  fileAttachs: string[];
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  link: string;
}