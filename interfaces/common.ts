export interface User {
    telegramId: string;
    studentId: string;
    token: string;
    idSinhVien: number;
  }
  
  // Type cho lỗi từ Axios
  export interface AxiosError {
    response?: {
      data?: any;
    };
  }