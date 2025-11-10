import { Context } from 'telegraf';

export interface AxiosError {
  response?: {
    data?: any;
  };
}

export interface SchoolApiResponse<T> {
  isOk: boolean;
  errorMessages?: errorMessages[];
  result?: T | null;
}

export interface errorMessages {
  errorCode: string;
  errorMessage: string;
  errorValues: string[];
}

export interface BotContext extends Context {
  state: {
    user?: any;
    studentId?: string;
  };
}