import { resolveColor, type EmbedData } from "discord.js";
import config from "../config";
import { app } from "..";

export class Embed {
  constructor(data: EmbedData) {
    return new Embed({
      ...data,
      color: resolveColor(config.color),
      footer: {
        text: `Jupiter CC | https://jptr.cloud`,
        iconURL: app.user?.avatarURL({ extension: "png", size: 128 }) as string,
      },
    });
  }
}
