import { BotContext } from '../bot';
import logger from '../../utils/logger';

/**
 * Middleware to ensure that the update contains a message.
 * This is useful for commands that expect a message context.
 */
export const requireMessage = async (ctx: BotContext, next: () => Promise<void>) => {
  if (!ctx.message) {
    logger.debug('Ignoring update: No message found in context.');
    return;
  }
  return next();
};