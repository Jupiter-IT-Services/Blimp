import { ApplicationCommandType } from "discord.js";
import type { Command } from "../../core/typings";

export default {
  name: "setup",
  description: "🔨 | Inital server setup.",
  adminOnly: true,
  defaultMemberPermissions: ["Administrator"],
  type: ApplicationCommandType.ChatInput,
  usage: ["/setup"],
  run: ({ ctx, client, args }) => {

  },
} as Command;
