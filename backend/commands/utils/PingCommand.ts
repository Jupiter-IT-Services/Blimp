import { ApplicationCommandType } from "discord.js";
import type { Command } from "../../core/typings";

export default {
  name: "ping",
  description: "Pong...?",
  usage: ["/ping"],
  type: ApplicationCommandType.ChatInput,
  run: ({ ctx, client, args }) => {
    ctx.reply({
      content: `Pong! 🏓 *${client.ws.ping}ms*`,
    });
  },
} as Command;
