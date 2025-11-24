import { BotContext } from '@/interfaces/common';
import logger from '@/utils/logger';
import { Telegraf } from 'telegraf';
import schoolApi from '@/api/schoolApi';
import { InlineKeyboardButton } from '@telegraf/types';

// Hàm xử lý lệnh /news
export const handler = async (ctx: BotContext): Promise<void> => {
  try {
    const newsCategories = await schoolApi.getNewsCategories(ctx.state.user!.token);
    if (newsCategories.length === 0) {
      await ctx.reply('Không có danh mục tin tức nào!');
      return;
    }
    const text: string = 'Hãy chọn một danh mục tin tức:';
    const buttons = newsCategories.map((category) => [
      { text: category.tenDanhMucTinTuc, callback_data: `news/${category.id}_${category.tenDanhMucTinTuc}` },
    ]);

    if (ctx.message && !ctx.callbackQuery)
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
    else if (ctx.callbackQuery) {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
      await ctx.answerCbQuery();
    }
  } catch (error) {
    await ctx.reply((error as Error).message || 'Có lỗi khi lấy thông báo!');
  }

}

// Hàm xử lý callback từ nút tin tức
const newsActionHandler = async (ctx: BotContext): Promise<void> => {
  const [categoryIdMatch, categoryNameMatch] = [ctx.match?.[1], ctx.match?.[2]];
  logger.debug(`Đã nhận callback với categoryId: ${categoryIdMatch}, categoryName: ${categoryNameMatch}`);
  if (!categoryIdMatch) {
    await ctx.editMessageText('Không tìm thấy danh mục tin tức!');
    return;
  }

  const categoryId = categoryIdMatch;
  const backButton: InlineKeyboardButton[][] = [[{ text: 'Quay lại', callback_data: `news` }]];
  try {
    logger.debug(`Gọi API getNews với categoryId: ${categoryId}`);
    const newsItems = await schoolApi.getNews(ctx.state.user!.token, Number(categoryId));

    if (newsItems.length === 0) {
      await ctx.editMessageText(`Không có tin tức nào trong danh mục <b>${categoryNameMatch}</b>!`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: backButton } });
      await ctx.answerCbQuery();
      return;
    }

    // Tạo danh sách tin tức với link chi tiết
    const text = newsItems
      .map((item) => `<b>${item.title}</b>\n${item.date}\n<a href="${item.link}">Xem chi tiết</a>`)
      .join('\n\n');
    await ctx.editMessageText(`Danh sách tin tức: <b>${categoryNameMatch}</b>\n${text}`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: backButton } });
    await ctx.answerCbQuery();
  } catch (error) {
    logger.error(`Lỗi khi lấy tin tức: ${(error as Error).message}`);
    await ctx.editMessageText((error as Error).message || 'Có lỗi khi lấy tin tức!', { reply_markup: { inline_keyboard: backButton } });
    await ctx.answerCbQuery();
  }
};

// Hàm xử lý callback chi tiết tin tức
const newsDetailActionHandler = async (ctx: any): Promise<void> => {
  const newsIdMatch = ctx.match && ctx.match[1];
  logger.debug(`Đã nhận callback với newsId: ${newsIdMatch}`);
  if (!newsIdMatch) {
    await ctx.reply('Không tìm thấy tin tức!');
    return;
  }
  try {
    const newsId = newsIdMatch;
    logger.debug(`Gọi API getNewsDetail với newsId: ${newsId}`);
    const newsDetail = await schoolApi.getNewsDetail(ctx.state.user!.token, Number(newsId));
    const text: string = `<b>${newsDetail.tieuDe}</b>\nNgày ${newsDetail.ngayDangTin}\n<i>Bot chưa hỗ trợ hiển thị nội dung tin tức, vui lòng xem trên trình duyệt!</i>`;
    await ctx.reply(text, { parse_mode: 'HTML' });
    await ctx.answerCbQuery();
  } catch (error) {
    await ctx.reply((error as Error).message || 'Có lỗi khi lấy tin tức!');
    await ctx.answerCbQuery();
  }
};

// Export handler với bot.action
export const initNewsActions = (bot: Telegraf<BotContext>) => {
  bot.action(/news\/detail\/(.+)/, newsDetailActionHandler);
  bot.action(/news\/(\d+)_(.+)/, newsActionHandler);
  bot.action(/news/, handler);
}
