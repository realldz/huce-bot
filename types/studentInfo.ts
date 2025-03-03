export interface StudentInfoResponse {
    result: {
      idSinhVien: number;
      hoTen: string;
      hinhAnh: string | null;
      chiTiets: { label: string; value: string }[];
    };
  }