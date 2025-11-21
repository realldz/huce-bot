import { BotContext } from '@/interfaces/common';
import { helpMessage } from "@/bot/commandsList";

export const handler = async (ctx: BotContext): Promise<void> => {
  await ctx.reply(helpMessage, { parse_mode: 'HTML' });
}