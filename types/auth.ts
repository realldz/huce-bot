export interface LoginResponse {
  access_token: string;
  token_type: string;
  expries_in: number;
  refresh_token: string;
  id_token: string;
}

export interface AuthResult {
  token: string;
  idSinhVien: number;
}