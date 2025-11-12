import { BotContext } from "@/interfaces/common";
import logger from '@/utils/logger';

export const onlyAllowPrivateChat = (ctx: BotContext, next: () => Promise<void>) => {
    if (ctx.chat?.type !== 'private') {
        logger.warn(`Bot đã được gọi từ đoạn chat không phải private: ${ctx.chat?.type} ID: ${ctx.chat?.id}`);
        ctx.reply('Bot chỉ được sử dụng trong private chat');
        return;
    }
    return next();
}