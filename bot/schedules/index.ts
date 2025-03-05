import { Telegraf } from 'telegraf';
import { BotContext } from '../bot';
import { scheduleJob } from 'node-schedule';
import logger from '../../utils/logger';
import { dailyScheduleTask } from './dailySchedule';
import { dailyNewsTask } from './dailyNews';


// Interface cho scheduled task
interface ScheduledTask {
  name: string;
  cron: string; // Cron schedule (VD: '0 0 6 * * *')
  execute: (bot: Telegraf<BotContext>) => Promise<void>;
}

// Danh sách các task
const tasks: ScheduledTask[] = [
  {
    name: 'Daily Schedule Notification',
    cron: '0 0 6 * * *', // 6:00 sáng mỗi ngày
    execute: dailyScheduleTask,
  },
  {
    name: 'Daily News Notification',
    cron: '0 0 12,17 * * *', // 7:00 sáng
    execute: dailyNewsTask,
  },
  // Thêm task khác ở đây trong tương lai
];

// Hàm khởi động scheduler
export function startScheduler(bot: Telegraf<BotContext>) {
  tasks.forEach((task) => {
    scheduleJob(task.cron, async () => {
      logger.info(`Bắt đầu chạy scheduled task: ${task.name}`);
      try {
        await task.execute(bot);
        logger.info(`Hoàn thành ${task.name}`);
      } catch (error) {
        const err = error as Error;
        logger.error(`Lỗi khi chạy ${task.name}: ${err.message}`);
      }
    });
  });
  logger.info(`Scheduler đã khởi động với các task: ${(tasks.map(t => t.name))}`);
}