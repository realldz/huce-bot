import bot from './bot/bot';
import logger from './utils/logger';
import { startScheduler } from './bot/schedules';
import config from './config/config';

// Khởi động bot
async function startBot() {
    try {
        logger.info('Bot đang khởi động...');

        const useWebhook = config.WEBHOOK_DOMAIN !== '';

        bot.launch({
            ...(useWebhook && {
                webhook: {
                    domain: config.WEBHOOK_DOMAIN!,
                    port: Number(config.PORT) || 3000,
                },
            }),
        }, () => {
            logger.info('Bot đã khởi động thành công');
            startScheduler(bot);
        });
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