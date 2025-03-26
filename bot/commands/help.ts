import { BotContext } from '../bot';
import logger from '../../utils/logger';
import {helpMessage} from "../commandsList";

export default {
  handler: async (ctx: BotContext): Promise<void> => {
    await ctx.reply(helpMessage, { parse_mode: 'HTML' });
  },
};