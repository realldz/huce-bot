import { BotContext } from '../bot';
import logger from '../../utils/logger';
import { Telegraf } from 'telegraf';
import { parseNewsFromHtml } from '../../utils/helpers';
import schoolApi from '../../api/schoolApi';

// Hàm xử lý lệnh /news
const newsHandler = async (ctx: BotContext): Promise<void> => {
  try {
    const newsCategories = await schoolApi.getNewsCategories(ctx.state.user!.token);
    if (newsCategories.length === 0) {
      await ctx.reply('Không có danh mục tin tức nào!');
      return;
    }
    const text: string = 'Hãy chọn một danh mục tin tức:';
    const buttons = newsCategories.map((category) => [
      { text: category.tenDanhMucTinTuc, callback_data: `news_${category.id}_${category.tenDanhMucTinTuc}` },
    ]);
    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } });
  } catch (error) {
    await ctx.reply((error as Error).message || 'Có lỗi khi lấy thông báo!');
  }
};

// Hàm xử lý callback từ nút tin tức
const newsActionHandler = async (ctx: any): Promise<void> => {
  const [categoryIdMatch, categoryNameMatch] = [ctx.match[1], ctx.match[2]];
  logger.info(`Đã nhận callback với categoryId: ${categoryIdMatch}, categoryName: ${categoryNameMatch}`);
  if (!categoryIdMatch) {
    await ctx.reply('Không tìm thấy danh mục tin tức!');
    return;
  }

  const categoryId = categoryIdMatch;

  try {
    logger.info(`Gọi API getNews với categoryId: ${categoryId}`);
    const html = await schoolApi.getNews(ctx.state.user!.token, Number(categoryId)); // HTML từ crawl
    const newsItems = parseNewsFromHtml(html);

    if (newsItems.length === 0) {
      await ctx.reply(`Không có tin tức nào trong danh mục <b>${categoryNameMatch}</b>!`, { parse_mode: 'HTML' });
      await ctx.answerCbQuery();
      return;
    }

    // Tạo danh sách tin tức với link chi tiết
    const text = newsItems
      .map((item) => `<b>${item.title}</b>\n${item.date}\n<a href="${item.link}">Xem chi tiết</a>`)
      .join('\n\n');
    await ctx.reply(`Danh sách tin tức: <b>${categoryNameMatch}</b>\n${text}`, { parse_mode: 'HTML' });
    await ctx.answerCbQuery();
  } catch (error) {
    logger.error(`Lỗi khi lấy tin tức: ${(error as Error).message}`);
    await ctx.reply((error as Error).message || 'Có lỗi khi lấy tin tức!');
    await ctx.answerCbQuery();
  }
};

// Hàm xử lý callback chi tiết tin tức
const newsDetailActionHandler = async (ctx: any): Promise<void> => {
  const newsIdMatch = ctx.match && ctx.match[1];
  logger.info(`Đã nhận callback với newsId: ${newsIdMatch}`);
  if (!newsIdMatch) {
    await ctx.reply('Không tìm thấy tin tức!');
    return;
  }
  try {
    const newsId = newsIdMatch;
    logger.info(`Gọi API getNewsDetail với newsId: ${newsId}`);
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
export default {
  handler: (bot: Telegraf<BotContext>) => {
    bot.action(/news_(\d+)_(.+)/, newsActionHandler);
    bot.action(/newsDetail_(.+)/, newsDetailActionHandler);
    return newsHandler;
  },
};