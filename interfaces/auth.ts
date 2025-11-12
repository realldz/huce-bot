export interface SucessLogin {
  access_token: string;
  token_type: string;
  expries_in: number;
  refresh_token: string;
  id_token: string;
}

export interface FailedLogin {
  warningMessages: Array<any>,
  errorMessages: [
    {
      errorCode: string,
      errorMessage: string,
      errorValues: Array<string>
    }
  ],
  isOk: boolean
}

export type LoginResponse = SucessLogin | FailedLogin


export interface AuthResult {
  token: string;
  idSinhVien: number;
}