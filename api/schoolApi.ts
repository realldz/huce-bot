import axios, { AxiosInstance, AxiosResponse } from 'axios';
import qs from 'qs';
import https from 'https';
import config from '../config/config';
import { AuthResult, LoginResponse } from '../interfaces/auth';
import { ScheduleResponse } from '../interfaces/schedule';
import { StudentInfoResponse } from '../interfaces/studentInfo';
import { GradeDetailResponse, GradesResponse } from '../interfaces/grades';
import { Notice, NoticeResponse } from '../interfaces/notices';
import { AxiosError } from '../interfaces/common';
import logger from '../utils/logger';
import { News, NewsCategory, NewsCategoryResponse, NewsDetail, NewsDetailResponse } from '../interfaces/news';
import { getCurrentIsoDate } from '../utils/helpers';
import { CheckinRequest, CheckinResponse, ListCheckinResponse } from "../interfaces/checkin";

const customAxios: AxiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

async function apiCall<T>(
  request: () => Promise<AxiosResponse<T>>,
  url: string,
  data: any,
  headers: Record<string, string>
): Promise<T> {
  logger.debug('Sending request:', { url, data, headers });

  try {
    const response = await request();

    logger.debug('Received response:', { url, response: response.data });

    return response.data;
  } catch (error) {
    const err = error as Error & AxiosError;
    logger.error('API call failed:', 'response' in err && err.response ? err.response.data : err.message);
    throw new Error('Có lỗi xảy ra khi gọi API!');
  }
}

class SchoolApi {
  private async postRequest<T>(
    url: string,
    data: any,
    token?: string,
    contentType: string = 'application/json'
  ): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': contentType };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return apiCall<T>(
      () => customAxios.post<T>(url, data, { headers }),
      url,
      data,
      headers
    );
  }

  async login(studentId: string, password: string): Promise<AuthResult> {
    const params = new URLSearchParams();
    params.append('url_uni', config.SCHOOL_API_BASEURL + '/AppSVGV');
    params.append('username', `${studentId}2${config.SCHOOL_CODE}`);
    params.append('password', password);
    params.append('client_secret', config.CLIENT_SECRET);
    params.append('client_id', 'mobile_flutter');
    params.append('grant_type', 'password');
    params.append('scope', 'offline_access openid');

    try {
      const response = await this.postRequest<LoginResponse>(
        'https://mobile.oneuni.com.vn/AUTH/connect/token',
        params,
        undefined,
        'application/x-www-form-urlencoded'
      );
      const token = response.access_token;
      const studentInfo = await this.getStudentInfo(token);
      const idSinhVien = studentInfo.result.idSinhVien;

      return { token, idSinhVien };
    } catch (error) {
      throw new Error('Đăng nhập thất bại, kiểm tra lại mã sinh viên hoặc mật khẩu!');
    }
  }

  async getSchedule(
    token: string,
    tuNgay: string | null = null,
    denNgay: string | null = null
  ): Promise<ScheduleResponse> {
    const today = getCurrentIsoDate();
    const defaultDate = today.toISOString().split('T')[0] + 'T00:00:00.000';

    return this.postRequest<ScheduleResponse>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/LichHocLichThi`,
      {
        loaiLich: 0,
        tuNgay: tuNgay || defaultDate,
        denNgay: denNgay || defaultDate,
      },
      token
    );
  }

  async getStudentInfo(token: string): Promise<StudentInfoResponse> {
    return this.postRequest<StudentInfoResponse>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/Info`,
      {},
      token
    );
  }

  async getGrades(token: string): Promise<GradesResponse> {
    return this.postRequest<GradesResponse>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/KetQuaHocTap`,
      {},
      token
    );
  }

  async getGradeDetail(token: string, idLopHocPhan: string): Promise<GradeDetailResponse> {
    return this.postRequest<GradeDetailResponse>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/KetQuaHocTapChiTiet`,
      { idLopHocPhan },
      token
    );
  }

  async getNewsCategories(token: string): Promise<NewsCategory[]> {
    const response = await this.postRequest<NewsCategoryResponse>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/TinTuc/DanhMucTinTuc`,
      {},
      token
    );
    return response.result;
  }

  async getNews(token: string, categoryId?: number): Promise<string> {
    return this.postRequest<string>(
      `${config.SCHOOL_API_BASEURL}/SinhVienTinTuc/GetTinForWeb_PageLogin`,
      `ViewName=ViewLogin_TinTucSinhVien&PageSize=5${categoryId ? `&&IDDanhMuc=${categoryId}` : ''}`,
      token
    );
  }

  async getNewsDetail(token: string, newsId: number): Promise<NewsDetail> {
    const response = await this.postRequest<NewsDetailResponse>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/TinTuc/BlogDetail`,
      { id: newsId },
      token
    );
    return response.result;
  }

  async getListCheckin(token: string): Promise<ListCheckinResponse> {
    return this.postRequest<ListCheckinResponse>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/LichDiemDanh`,
      {},
      token
    );
  }

  async checkin(token: string, request: CheckinRequest): Promise<CheckinResponse> {
    return this.postRequest<CheckinResponse>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/SubmitDiemDanh`,
      { request },
      token
    );
  }

  async getNotices(token: string): Promise<NoticeResponse> {
    return this.postRequest<NoticeResponse>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/Notify/NhacNhoSinhVienPopup`,
      {},
      token
    );
  }

  async updateNoticeStatus(token: string, idSinhVien: number, idGhiChu: number): Promise<boolean> {
    const response = await this.postRequest<{ result: { isOk: boolean } }>(
      `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/Notify/UpdateXemNhacNho`,
      { idSinhVien, idGhiChu },
      token
    );
    return response.result.isOk;
  }
}

export default new SchoolApi();