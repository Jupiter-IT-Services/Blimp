import { resolveColor, type EmbedData } from "discord.js";
import { app } from "..";
import config from "../config";

export class Embed {
  constructor(data: EmbedData) {
    return new Embed({
      ...data,
      color: resolveColor(config.colors.default),
      footer: {
        text: `Jupiter CC | https://jptr.cloud`,
        iconURL: app.user?.avatarURL({ extension: "png", size: 128 }) as string,
      },
    });
  }
}
