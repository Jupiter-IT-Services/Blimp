import {
  resolveColor,
  type EmbedData,
  EmbedBuilder as DiscordEmbed,
} from "discord.js";
import { app } from "..";
import config from "../config";
import CoreBot from "./Core";
import { Command } from "./typings";

export class Embed {
  constructor(data: EmbedData) {
    return new DiscordEmbed({
      color: resolveColor(config.colors.default),
      footer: {
        text: `blimp • /help`,
      },
      ...data,
    });
  }
}

export const defaultEmbeds = {
  "missing-values": (cmd: Command, client: CoreBot) =>
    new Embed({
      title: "Invalid/Missing Arguments",
      color: resolveColor(config.colors.error),
      description: `${config.emojis.cross} Please check your arguments and ensure all required forms are provided.`,
      footer: {
        text: `Need more help? /help ${cmd.name}`,
        iconURL:
          client.user?.avatarURL({ extension: "png", size: 128 }) || undefined,
      },
    }),
  "missing-permissions": () =>
    new Embed({
      title: "Insignificant Permissions",
      color: resolveColor(config.colors.warn),
      description: `${config.emojis.mod} You are missing the required permissions to use this command.`,
    }),
};
