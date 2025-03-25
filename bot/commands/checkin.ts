import schoolApi from "../../api/schoolApi";
import { BotContext } from "../bot";
import { CheckinResponse, ListCheckinResponse } from "../../interfaces/checkin";
import { Telegraf } from "telegraf";
import locationApi from "../../api/locationApi";
import logger from "../../utils/logger";

const pendingCheckins = new Map<number, { messageId: number; idLichHoc: string; location: string }>();

const handleCheckin = async (ctx: BotContext, idLichHoc: string, location: string) => {
    const sentMessage = await ctx.reply(
        `Điểm danh cho lịch học ${idLichHoc}.\nBot sẽ tự viết hoa lại code\nTrả lời tin nhắn này với mã điểm danh:`,
        { parse_mode: 'markdown', reply_markup: { force_reply: true  } }
    );
    await ctx.answerCbQuery();
    pendingCheckins.set(ctx.from.id, { messageId: sentMessage.message_id, idLichHoc, location });
};

const handleReply = async (ctx: BotContext) => {
    // Bỏ qua nếu tin nhắn là lệnh
    if (!ctx.message?.text || ctx.message.text.startsWith('/')) return;

    const userId = ctx.from.id;
    const checkinData = pendingCheckins.get(userId);
    if (!checkinData) return;

    if (ctx.message.reply_to_message?.message_id !== checkinData.messageId) return;

    const maDiemDanh = ctx.message.text;
    pendingCheckins.delete(userId);
    const ip = (Math.floor(Math.random() * 255) + 1)+"."+(Math.floor(Math.random() * 255))+"."+(Math.floor(Math.random() * 255))+"."+(Math.floor(Math.random() * 255));
    const lat = checkinData.location.split(';')[0];
    const long = checkinData.location.split(';')[1];
    const viTri = (await locationApi.reverseGeocode(lat, long)).display_name;
    const response: CheckinResponse = await schoolApi.checkin(ctx.state.user.token, {
        idLichHoc: checkinData.idLichHoc,
        code: maDiemDanh.toString().toUpperCase(),
        ipAddress: ip, //fakeip
        isCanhBao: false,
        location: checkinData.location.replace(';',','),
        viTri,
    });
    await ctx.reply(response.isOk ? 'Điểm danh thành công!' : `Điểm danh thất bại! ${response.errorMessages?.[0]?.errorMessage || ''}`);
};

export default {
    handler: (bot: Telegraf<BotContext>) => {
        const listCheckinHandler = async (ctx: BotContext): Promise<void> => {
            const responses: ListCheckinResponse = await schoolApi.getListCheckin(ctx.state.user.token);
            if (responses.result?.length) {
                let message = 'Danh sách điểm danh:\n';
                const buttons = responses.result.map((checkinItem) => {
                    const ngayHoc = new Date(checkinItem.ngayHoc).toLocaleDateString('vi-VN');
                    message += `<b>[${checkinItem.idLichHoc}] ${checkinItem.tenMonHoc}</b> (${ngayHoc})\n`;
                    checkinItem.chiTiets.forEach((chiTiet) => {
                        message += `<b>${chiTiet.label}:</b> ${chiTiet.value}\n`;
                    });
                    message += `\n`;
                    return [{ text: `Điểm danh ${checkinItem.tenMonHoc}`, callback_data: `checkin_${checkinItem.idLichHoc}_${checkinItem.locationTruong}` }];
                });
                await ctx.reply(message, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } });
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
