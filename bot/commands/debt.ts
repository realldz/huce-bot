import { BotContext } from "@/interfaces/common";
import schoolApi from "@/api/schoolApi";
export default {
    handler: async (ctx: BotContext): Promise<void> => {
        // try {
        const debtInfo = await schoolApi.getDebt(ctx.state.user.token);

        // console.log(debtInfo);
        if (!debtInfo.result || debtInfo.result.length === 0) {
            await ctx.reply('Bạn không có nợ học phí nào!');
            return;
        }

        let message = '';
        debtInfo.result.congNos.map((debt) => {
            message += `<b>Mã :</b> <code>${debt.ma}</code>\n`;
            message += `<b>Số tiền nộp:</b> <code>${debt.soTienNop.toLocaleString()}</code>\n`;
            message += `<b>Nội dung thu:</b> <code>${debt.noiDungThu}</code>\n`;
            message += `-------------------------\n`;
        });
        await ctx.reply(message, { parse_mode: 'HTML' });
        // } catch (error) {
        //     await ctx.reply((error as Error).message || 'Có lỗi khi lấy thông tin nợ học phí!');
        // }
    }
}