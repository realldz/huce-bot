import bot from './bot/bot';
import logger from './utils/logger';
import { startScheduler } from './bot/schedules';

// Khởi động bot
async function startBot() {
    logger.info('Bot đang khởi động...');
    bot.launch();
    startScheduler(bot); // Khởi động scheduler sau khi bot chạy
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