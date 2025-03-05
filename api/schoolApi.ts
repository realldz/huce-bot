import axios, { AxiosInstance, AxiosResponse } from 'axios';
import qs from 'qs';
import https from 'https';
import config from '../config/config';
import { AuthResult, LoginResponse } from '../interfaces/auth';
import { ScheduleResponse } from '../interfaces/schedule';
import { StudentInfoResponse } from '../interfaces/studentInfo';
import { GradesResponse } from '../interfaces/grades';
import { GradeDetailResponse } from '../interfaces/gradeDetail';
import { Notice } from '../interfaces/notices';
import { AxiosError } from '../interfaces/common';
import { NewsCategory } from '../interfaces/newsCategory';
import logger from '../utils/logger';
import { News } from '../interfaces/news';
import { NewsDetail } from '../interfaces/newsDetail';

const customAxios: AxiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

class SchoolApi {
  async login(studentId: string, password: string): Promise<AuthResult> {
    const params = new URLSearchParams();
    params.append('url_uni', config.SCHOOL_API_BASEURL);
    params.append('username', `${studentId}2${config.SCHOOL_CODE}`);
    params.append('password', password);
    params.append('client_secret', config.CLIENT_SECRET);
    params.append('client_id', 'mobile_flutter');
    params.append('grant_type', 'password');
    params.append('scope', 'offline_access openid');

    try {
      const response: AxiosResponse<LoginResponse> = await customAxios.post(
        'https://mobile.oneuni.com.vn/AUTH/connect/token',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const token: string = response.data.access_token;
      const studentInfo: StudentInfoResponse = await this.getStudentInfo(token);
      const idSinhVien: number = studentInfo.result.idSinhVien;

      return { token, idSinhVien };
    } catch (error) {
      const err = error as Error & AxiosError;
      logger.error('Login failed:', 'response' in err && err.response ? err.response.data : err.message);
      throw new Error('Đăng nhập thất bại, kiểm tra lại mã sinh viên hoặc mật khẩu!');
    }
  }

  async getSchedule(token: string, tuNgay: string | null = null, denNgay: string | null = null): Promise<ScheduleResponse> {
    const today = new Date();
    const defaultDate: string = today.toISOString().split('T')[0] + 'T00:00:00.000';

    try {
      const response: AxiosResponse<ScheduleResponse> = await customAxios.post(
        `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/LichHocLichThi`,
        {
          loaiLich: 0,
          tuNgay: tuNgay || defaultDate,
          denNgay: denNgay || defaultDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      const err = error as Error & AxiosError;
      logger.error('Error fetching schedule:', 'response' in err && err.response ? err.response.data : err.message);
      throw new Error('Không thể lấy lịch học!');
    }
  }

  async getStudentInfo(token: string): Promise<StudentInfoResponse> {
    try {
      const response: AxiosResponse<StudentInfoResponse> = await customAxios.post(
        `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/Info`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const err = error as Error & AxiosError;
      logger.error('Error fetching profile:', 'response' in err && err.response ? err.response.data : err.message);
      throw new Error('Không thể lấy thông tin cá nhân!');
    }
  }

  async getGrades(token: string, idSinhVien: number): Promise<GradesResponse> {
    try {
      const response: AxiosResponse<GradesResponse> = await customAxios.post(
        `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/KetQuaHocTap`,
        { idSinhVien },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      const err = error as Error & AxiosError;
      logger.error('Error fetching grades:', 'response' in err && err.response ? err.response.data : err.message);
      throw new Error('Không thể lấy kết quả học tập!');
    }
  }

  async getGradeDetail(token: string, idSinhVien: number, idLopHocPhan: string): Promise<GradeDetailResponse> {
    try {
      const response: AxiosResponse<GradeDetailResponse> = await customAxios.post(
        `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/KetQuaHocTapChiTiet`,
        { idSinhVien, idLopHocPhan },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      const err = error as Error & AxiosError;
      logger.error('Error fetching grade detail:', 'response' in err && err.response ? err.response.data : err.message);
      throw new Error('Không thể lấy chi tiết điểm môn học!');
    }
  }

  async getNewsCategories(token: string): Promise<NewsCategory[]> {
    try {
      const response: AxiosResponse<{ result: NewsCategory[] }> = await customAxios.post(
        `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/TinTuc/DanhMucTinTuc`,
        {},
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );
      return response.data.result;
    } catch (error) {
      const err = error as Error & AxiosError;
      logger.error('Error fetching news categories:', 'response' in err && err.response ? err.response.data : err.message);
      throw new Error('Không thể lấy danh sách danh mục!');
    }
  }

  async getNews(token: string, categoryId?: number): Promise<string> {
    try {
      const response = await customAxios.post(
        `${config.SCHOOL_API_BASEURL}/SinhVienTinTuc/GetTinForWeb_PageLogin`, 
        `ViewName=ViewLogin_TinTucSinhVien&PageSize=5${categoryId ? `&&IDDanhMuc=${categoryId}` : ''}`,
      );
      return response.data;
    } catch (error) {
      const err = error as Error & AxiosError;
      logger.error('Error fetching news:', 'response' in err && err.response ? err.response.data : err);
      throw new Error('Không thể lấy tin tức!');
    }
  }

  async getNewsDetail(token: string, newsId: number): Promise<NewsDetail> {
    try {
      const response: AxiosResponse<{ result: NewsDetail }> = await customAxios.post(
        `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/TinTuc/BlogDetail`,
        { id: newsId },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );
      return response.data.result;
    } catch (error) {
      const err = error as Error & AxiosError;
      logger.error('Error fetching news detail:', 'response' in err && err.response ? err.response.data : err.message);
      throw new Error('Không thể lấy chi tiết tin tức!');
    }
  }

  async getNotices(token: string): Promise<Notice[]> {
    try {
      const response: AxiosResponse<Notice[]> = await customAxios.get(
        `${config.SCHOOL_API_BASEURL}/AppSVGV/notices`,
        {
          headers: { Authorization: `${token}` },
        }
      );
      return response.data;
    } catch (error) {
      const err = error as Error & AxiosError;
      logger.error('Error fetching notices:', 'response' in err && err.response ? err.response.data : err.message);
      throw new Error('Không thể lấy thông báo!');
    }
  }
}

export default new SchoolApi();