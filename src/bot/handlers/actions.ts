import { BotContext } from "@/interfaces/common";
import { Telegraf } from "telegraf";
import { grades } from "../commands";

export const registerActions = (bot: Telegraf<BotContext>) => {
  grades.initGradesActions(bot);
}