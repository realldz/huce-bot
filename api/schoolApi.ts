import config from '../config/config';
import { AuthResult, LoginResponse } from '../interfaces/auth';
import { ScheduleResponse } from '../interfaces/schedule';
import { StudentInfoResponse } from '../interfaces/studentInfo';
import { GradeDetailResponse, GradesResponse } from '../interfaces/grades';
import { NoticeResponse } from '../interfaces/notices';
import { NewsCategory, NewsCategoryResponse, NewsDetail, NewsDetailResponse, NewsItem } from '../interfaces/news';
import { getCurrentIsoDate } from '../utils/helpers';
import { CheckinRequest, CheckinResponse, ListCheckinResponse } from "../interfaces/checkin";
import { load } from 'cheerio';
import customAxios from './customAxios';


const postRequest = async <T>(
  url: string,
  data: any,
  token?: string,
  contentType: string = 'application/json'
): Promise<T> => {
  const headers: Record<string, string> = { 'Content-Type': contentType };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await customAxios.post<T>(url, data, {
    headers,
    validateStatus: (status) => status < 500
  });
  return response.data;
};

const login = async (studentId: string, password: string): Promise<AuthResult> => {
  const params = new URLSearchParams();
  params.append('url_uni', config.SCHOOL_API_BASEURL + '/AppSVGV');
  params.append('username', `${studentId}2${config.SCHOOL_CODE}`);
  params.append('password', password);
  params.append('client_secret', config.CLIENT_SECRET);
  params.append('client_id', 'mobile_flutter');
  params.append('grant_type', 'password');
  params.append('scope', 'offline_access openid');

  try {
    const response = await postRequest<LoginResponse>(
      'https://mobile.oneuni.com.vn/AUTH/connect/token',
      params,
      undefined,
      'application/x-www-form-urlencoded'
    );
    const token = response.access_token;
    const studentInfo = await getStudentInfo(token);
    const idSinhVien = studentInfo.result.idSinhVien;

    return { token, idSinhVien };
  } catch (error) {
    throw new Error('Đăng nhập thất bại, kiểm tra lại mã sinh viên hoặc mật khẩu!');
  }
};

const getSchedule = async (
  token: string,
  tuNgay: string | null = null,
  denNgay: string | null = null
): Promise<ScheduleResponse> => {
  const today = getCurrentIsoDate();
  const defaultDate = today.toISOString().split('T')[0] + 'T00:00:00.000';

  return postRequest<ScheduleResponse>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/LichHocLichThi`,
    {
      loaiLich: 0,
      tuNgay: tuNgay || defaultDate,
      denNgay: denNgay || defaultDate,
    },
    token
  );
};

const getStudentInfo = async (token: string): Promise<StudentInfoResponse> => {
  return postRequest<StudentInfoResponse>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/Info`,
    {},
    token
  );
};

const getGrades = async (token: string): Promise<GradesResponse> => {
  return postRequest<GradesResponse>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/KetQuaHocTap`,
    {},
    token
  );
};

const getGradeDetail = async (token: string, idLopHocPhan: string): Promise<GradeDetailResponse> => {
  return postRequest<GradeDetailResponse>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/KetQuaHocTapChiTiet`,
    { idLopHocPhan },
    token
  );
};

const getNewsCategories = async (token: string): Promise<NewsCategory[]> => {
  const response = await postRequest<NewsCategoryResponse>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/TinTuc/DanhMucTinTuc`,
    {},
    token
  );
  return response.result;
};

const parseNewsHtml = (html: string): NewsItem[] => {
  const $ = load(html);
  const newsItems: NewsItem[] = [];

  $('.item-notifi').each((_, element) => {
    const dateRaw = $(element).find('.date-notifi').text().trim().replace(/\s+/g, ' ');
    const [__, month, day] = dateRaw.split(' ');
    const formattedDate = `${day} Tháng ${month}`; // "25 Tháng 02"
    const title = $(element).find('.title-notifi').text().trim();
    const link = $(element).find('.view-more a.view').attr('href');
    const id = $(element).find('.title-notifi').attr('data-post-id') || '';
    const fullLink = link ? `${config.SCHOOL_API_BASEURL}${link}` : '';
    if (id) newsItems.push({ id, date: formattedDate, title, link: fullLink });
  });

  return newsItems;
}

const getNews = async (token: string, categoryId?: number): Promise<NewsItem[]> => {
  const html = await postRequest<string>(
    `${config.SCHOOL_API_BASEURL}/SinhVienTinTuc/GetTinForWeb_PageLogin`,
    `ViewName=ViewLogin_TinTucSinhVien&PageSize=5${categoryId ? `&IDDanhMuc=${categoryId}` : ''}`,
    token,
    'application/x-www-form-urlencoded'
  );
  return parseNewsHtml(html);
};

const getNewsDetail = async (token: string, newsId: number): Promise<NewsDetail> => {
  const response = await postRequest<NewsDetailResponse>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/TinTuc/BlogDetail`,
    { id: newsId },
    token
  );
  return response.result;
};

const getListCheckin = async (token: string): Promise<ListCheckinResponse> => {
  return postRequest<ListCheckinResponse>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/LichDiemDanh`,
    {},
    token
  );
};

const checkin = async (token: string, request: CheckinRequest): Promise<CheckinResponse> => {
  return postRequest<CheckinResponse>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/SinhVien/SubmitDiemDanh`,
    { request },
    token
  );
};

const getNotices = async (token: string): Promise<NoticeResponse> => {
  return postRequest<NoticeResponse>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/Notify/NhacNhoSinhVienPopup`,
    {},
    token
  );
};

const updateNoticeStatus = async (token: string, idSinhVien: number, idGhiChu: number): Promise<boolean> => {
  const response = await postRequest<{ result: { isOk: boolean } }>(
    `${config.SCHOOL_API_BASEURL}/AppSVGV/api/v1/Notify/UpdateXemNhacNho`,
    { idSinhVien, idGhiChu },
    token
  );
  return response.result.isOk;
};

export default {
  login,
  getSchedule,
  getStudentInfo,
  getGrades,
  getGradeDetail,
  getNewsCategories,
  getNews,
  getNewsDetail,
  getListCheckin,
  checkin,
  getNotices,
  updateNoticeStatus,
};