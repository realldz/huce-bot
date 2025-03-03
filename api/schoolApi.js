import axios from "axios";
import config from "../config/config.js";
import https from "https"; // Thêm module https

// Tạo instance axios với cấu hình global
const customAxios = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Tắt xác minh chứng chỉ cho tất cả request
  }),
});

class SchoolApi {
  async login(studentId, password) {
    const params = new URLSearchParams();
    params.append('url_uni', config.SCHOOL_API_URL);
    params.append('username', `${studentId}2HUCE`);
    params.append('password', password);
    params.append('client_secret', config.CLIENT_SECRET);
    params.append('client_id', 'mobile_flutter');
    params.append('grant_type', 'password');
    params.append('scope', 'offline_access openid');

    try {
      const response = await customAxios.post(
        'https://mobile.oneuni.com.vn/AUTH/connect/token',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const token = response.data.access_token;

      // Gọi getStudentInfo để lấy idSinhVien
      const studentInfo = await this.getStudentInfo(token);
      const idSinhVien = studentInfo.result.idSinhVien;

      return { token, idSinhVien }; // Trả về cả token và idSinhVien
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw new Error('Đăng nhập thất bại, kiểm tra lại mã sinh viên hoặc mật khẩu!');
    }
  }

  async getSchedule(token, tuNgay = null, denNgay = null) {
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0] + 'T00:00:00.000';

    try {
      const response = await customAxios.post(
        `${config.SCHOOL_API_URL}/api/v1/SinhVien/LichHocLichThi`,
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
      console.error('Error fetching schedule:', error.response?.data || error.message);
      throw new Error('Không thể lấy lịch học!');
    }
  }

  async getStudentInfo(token) {
    try {
      const response = await customAxios.post(
        `${config.SCHOOL_API_URL}/api/v1/SinhVien/Info`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      throw new Error('Không thể lấy thông tin cá nhân!');
    }
  }

  async getGrades(token, idSinhVien) {
    try {
      const response = await customAxios.post(
        `${config.SCHOOL_API_URL}/api/v1/SinhVien/KetQuaHocTap`,
        { idSinhVien }, // Gửi idSinhVien trong body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error.response?.data || error.message);
      throw new Error('Không thể lấy kết quả học tập!');
    }
  }

  async getGradeDetail(token, idSinhVien, idLopHocPhan) {
    try {
      const response = await customAxios.post(
        `${config.SCHOOL_API_URL}/api/v1/SinhVien/KetQuaHocTapChiTiet`,
        { idSinhVien, idLopHocPhan },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching grade detail:', error.response?.data || error.message);
      throw new Error('Không thể lấy chi tiết điểm môn học!');
    }
  }

  async getNotices(token) {
    try {
      const response = await customAxios.get(`${config.SCHOOL_API_URL}/notices`, {
        headers: { Authorization: `${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching notices:", error);
      throw new Error("Không thể lấy thông báo!");
    }
  }
}

export default new SchoolApi();
