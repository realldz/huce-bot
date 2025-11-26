import { BotContext } from "@/interfaces/common";
import { Telegraf } from "telegraf";
import { grades, news, schedule } from "../commands";

export const registerActions = (bot: Telegraf<BotContext>) => {
  grades.initGradesActions(bot);
  news.initNewsActions(bot);
  schedule.initScheduleActions(bot);
}