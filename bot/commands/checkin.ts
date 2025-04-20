import schoolApi from "../../api/schoolApi";
import { BotContext } from "../bot";
import { CheckinResponse, ListCheckinResponse } from "../../interfaces/checkin";
import { Telegraf } from "telegraf";
import locationApi from "../../api/locationApi";
import logger from "../../utils/logger";
import { formatListCheckin } from "../../utils/helpers";

let cachedIpAddress: string | null = null;
let lastFetchedTime: number | null = null;

const getIpAddress = async (): Promise<string> => {
    const now = Date.now();
    if (cachedIpAddress && lastFetchedTime && (now - lastFetchedTime < 30 * 60 * 1000)) {
        return cachedIpAddress;
    }

    const response = await fetch('https://api.ipify.org/?format=json');
    const data = await response.json();
    cachedIpAddress = data.ip;
    lastFetchedTime = now;
    return cachedIpAddress;
};
const pendingCheckins = new Map<number, { messageId: number; idLichHoc: string; location: string }>();

const handleCheckin = async (ctx: BotContext, idLichHoc: string, location: string) => {
    const sentMessage = await ctx.reply(
        `Điểm danh cho lịch học ${idLichHoc}.\nTrả lời tin nhắn này với mã điểm danh:`,
        { parse_mode: 'Markdown', reply_markup: { force_reply: true } }
    );
    await ctx.answerCbQuery();
    pendingCheckins.set(ctx.from.id, { messageId: sentMessage.message_id, idLichHoc, location });
};

const handleReply = async (ctx: BotContext) => {
    // Bỏ qua nếu tin nhắn là lệnh
    if (!(ctx.message as { text: string }).text || (ctx.message as { text: string }).text.startsWith('/')) return;

    const userId = ctx.from.id;
    const checkinData = pendingCheckins.get(userId);
    if (!checkinData) return;

    // @ts-ignore
    if (ctx.message.reply_to_message.message_id !== checkinData.messageId) return;

    const maDiemDanh = (ctx.message as { text: string }).text;
    pendingCheckins.delete(userId);
    const ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
    const lat = parseFloat(checkinData.location.split(";")[0]);
    const long = parseFloat(checkinData.location.split(";")[1]);
    const roundedLat = String(Number(lat.toFixed(7)));
    const roundedLong = String(Number(long.toFixed(7)));
    const viTri = (await locationApi.reverseGeocode(roundedLat, roundedLong)).display_name;
    const response: CheckinResponse = await schoolApi.checkin(ctx.state.user.token, {
        idLichHoc: Number(checkinData.idLichHoc),
        idSinhVien: 1719729,
        code: maDiemDanh,
        deviceOSID: 'UP1A.231005.007',
        location: `${roundedLat},${roundedLong}`,
        ipAddress: await getIpAddress(), //fakeip
        isCanhBao: false,
        viTri,
    });
    await ctx.reply(response.isOk ? 'Điểm danh thành công!' : `Điểm danh thất bại! ${response.errorMessages?.[0]?.errorMessage || 'Unknown error'}`);
};

export default {
    handler: (bot: Telegraf<BotContext>) => {
        const listCheckinHandler = async (ctx: BotContext): Promise<void> => {
            const responses: ListCheckinResponse = await schoolApi.getListCheckin(ctx.state.user.token);
            if (responses.result?.length) {
                let message = 'Danh sách điểm danh:\n';
                const [formatedSchedule, buttons] = formatListCheckin(responses.result);
                message += formatedSchedule;
                await ctx.reply(message, {
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: buttons },
                });
            } else {
                await ctx.reply('Không có lịch học để điểm danh');
            }
        };

        bot.action(/checkin_(\d+)_(.+)/, async (ctx) => {
            await handleCheckin(ctx, ctx.match[1], ctx.match[2]);
        });

        return listCheckinHandler;
    },
    handleReply, // Xuất hàm handleReply để bot.ts gọi
};
