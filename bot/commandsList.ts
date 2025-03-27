export const commandsList = [
    { command: 'help', description: 'Danh sách lệnh đầy đủ' },
    { command: 'login', description: 'Đăng nhập bằng tài khoản sinh viên' },
    { command: 'logout', description: 'Đăng xuất khỏi bot' },
    { command: 'schedule', description: 'Lấy lịch học hôm nay' },
    { command: 'schedule ngày', description: 'Lấy lịch học ngày cụ thể (VD: /schedule 31/12/2025)' },
    { command: 'schedule từ_ngày đến_ngày', description: 'Lấy lịch học trong khoảng thời gian (VD: /schedule 01/12/2025 31/12/2025)' },
    { command: 'schedule week', description: 'Lấy lịch học tuần này' },
    { command: 'info', description: 'Xem thông tin cá nhân sinh viên' },
    { command: 'grades', description: 'Xem kết quả học tập' },
    { command: 'news', description: 'Xem tin tức từ nhà trường' },
    { command: 'checkin', description: 'Điểm danh cho lịch học' },
    { command: 'notices', description: 'Xem nhắc nhở sinh viên' },

];

// Chuỗi hiển thị trong /help
export const helpMessage = `Danh sách lệnh:\n${commandsList.map(cmd => `/${cmd.command} - ${cmd.description}`).join('\n')}

`;
