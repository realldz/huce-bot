import { InlineKeyboardButton } from '@telegraf/types';
import { formatDateStr, getWeekRange, ScheduleMode } from '@/services/scheduleService';

export const getScheduleButtons = (
    mode: ScheduleMode,
    currentDate?: string,
    weekStart?: string
): InlineKeyboardButton[][] => {
    const today = new Date();

    if (mode === 'today') {
        // Lịch hôm nay: Hôm qua | Ngày mai | Tuần này
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const { start, end } = getWeekRange(today);
        return [[
            { text: '⬅️ Hôm qua', callback_data: `schedule/date/${formatDateStr(yesterday)}` },
            { text: '➡️ Ngày mai', callback_data: `schedule/date/${formatDateStr(tomorrow)}` },
            { text: '📆 Tuần này', callback_data: `schedule/week/${formatDateStr(start)}_${formatDateStr(end)}` }
        ]];
    }

    if (mode === 'week' && weekStart) {
        // Lịch tuần: Hôm nay | 7 ngày trước | 7 ngày tiếp
        const [day, month, year] = weekStart.split('/').map(Number);
        const currentWeekStart = new Date(year, month - 1, day);

        const prevWeekStart = new Date(currentWeekStart);
        prevWeekStart.setDate(currentWeekStart.getDate() - 7);
        const prevWeekEnd = new Date(prevWeekStart);
        prevWeekEnd.setDate(prevWeekStart.getDate() + 6);

        const nextWeekStart = new Date(currentWeekStart);
        nextWeekStart.setDate(currentWeekStart.getDate() + 7);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

        return [[
            { text: '📅 Hôm nay', callback_data: 'schedule/today' },
            { text: '⬅️ 7 ngày trước', callback_data: `schedule/week/${formatDateStr(prevWeekStart)}_${formatDateStr(prevWeekEnd)}` },
            { text: '➡️ 7 ngày tiếp', callback_data: `schedule/week/${formatDateStr(nextWeekStart)}_${formatDateStr(nextWeekEnd)}` }
        ]];
    }

    // Lịch ngày cụ thể (không phải hôm nay): Ngày trước | Hôm nay | Ngày sau
    if (currentDate) {
        const [day, month, year] = currentDate.split('/').map(Number);
        const current = new Date(year, month - 1, day);
        const prev = new Date(current);
        prev.setDate(current.getDate() - 1);
        const next = new Date(current);
        next.setDate(current.getDate() + 1);
        return [[
            { text: '⬅️ Ngày trước', callback_data: `schedule/date/${formatDateStr(prev)}` },
            { text: '📅 Hôm nay', callback_data: 'schedule/today' },
            { text: '➡️ Ngày sau', callback_data: `schedule/date/${formatDateStr(next)}` }
        ]];
    }

    return [];
};
