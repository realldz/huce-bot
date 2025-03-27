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

export interface NoticeResponse {
  result: Notice[];
  errorMessages: string[];
  isOk: boolean;
}