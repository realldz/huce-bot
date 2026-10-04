import bot from './bot/bot';
import logger from './utils/logger';
import { startScheduler } from './bot/schedules';
import config from './config/config';
import { installPollingDeadline } from './bot/pollingResilience';

/** Thời gian chờ trước khi khởi động lại bot sau một lỗi chết người. */
const RESTART_DELAY_MS = 5000;

/** Chế độ webhook hay long polling, quyết định ngay từ cấu hình. */
const useWebhook = config.WEBHOOK_DOMAIN !== '';

if (!useWebhook) {
    // Vá lỗi polling của telegraf trên Bun — chỉ cài một lần duy nhất
    // (xem src/bot/pollingResilience.ts)
    installPollingDeadline(bot, logger);
}

/** startScheduler chỉ được chạy một lần, tránh nhân đôi cron mỗi lần polling khởi động lại. */
let schedulerStarted = false;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Khởi động bot
async function startBot(): Promise<void> {
    await bot.launch({
        ...(useWebhook && {
            webhook: {
                domain: config.WEBHOOK_DOMAIN!,
                port: Number(config.PORT) || 3000,
            },
        }),
    }, () => {
        logger.info('Bot đã khởi động thành công');
        if (!schedulerStarted) {
            schedulerStarted = true;
            startScheduler(bot);
        }
    });
}

/**
 * Ở chế độ polling, `bot.launch()` chỉ resolve khi bot dừng hẳn; nếu nó reject nghĩa là
 * kết nối tới Telegram đã chết hẳn, phải khởi động lại thay vì để tiến trình sống mà câm.
 * Bản vá trong pollingResilience.ts đã xử lý hầu hết lỗi mạng, đây là lớp dự phòng cuối.
 */
async function runBot(): Promise<void> {
    for (;;) {
        try {
            logger.info('Bot đang khởi động...');
            await startBot();
            return;
        } catch (err) {
            const code = (err as { code?: number } | undefined)?.code;

            if (code === 401) {
                logger.error('Telegram từ chối token (401). Kiểm tra lại TELEGRAM_TOKEN.', err);
                process.exit(1);
            }

            logger.error(`Mất kết nối Telegram, thử khởi động lại sau ${RESTART_DELAY_MS / 1000}s:`, err);
            await sleep(RESTART_DELAY_MS);
        }
    }
}


// Dừng bot
async function stopBot() {
    logger.info('Bot đang dừng...');
    bot.stop('SIGINT');
    logger.info('Bot đã dừng');
}
runBot();
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
