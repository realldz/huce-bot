import bot from './bot/bot';
import logger from './utils/logger';
import { startScheduler } from './bot/schedules';

// Khởi động bot
async function startBot() {
    try {
        logger.info('Bot đang khởi động...');

        const useWebhook = process.env.WEBHOOK_DOMAIN !== '';

        await bot.launch({
            ...(useWebhook && {
                webhook: {
                    domain: process.env.WEBHOOK_DOMAIN!,   // bắt buộc khi bật webhook
                    port: Number(process.env.PORT) || 3000,
                },
            }),
        });

        logger.info('Bot đã khởi động thành công');

        startScheduler(bot);
    } catch (err) {
        logger.error('Lỗi khi khởi động bot:', err);
        process.exit(1);
    }
}


// Dừng bot
async function stopBot() {
    logger.info('Bot đang dừng...');
    bot.stop('SIGINT');
    logger.info('Bot đã dừng');
}
startBot();
// Xử lý tín hiệu dừng từ hệ thống
process.once('SIGINT', async () => {
    await stopBot();
    process.exit(0);
});

process.once('SIGTERM', async () => {
    await stopBot();
    process.exit(0);
});
export default bot;