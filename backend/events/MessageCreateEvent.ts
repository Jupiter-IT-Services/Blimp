import type { ClientEvents, Message } from "discord.js";
import type { Event } from "../core/typings";
import { app } from "..";
import { guildConfig } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { err, info } from "../utils/logger";

export default {
  name: "messageCreate",
  run: async (message: Message) => {
    if (message.guild) {
      if (message.content.includes(`<@${app.user?.id}>`)) {

      }
      const data = await db.select().from(guildConfig).where(eq(guildConfig.id, message.guild.id))
      if (!data || !data[0]) {
        await db.insert(guildConfig).values({
          id: message.guild.id,
        }).execute().then((d) => {
          info(`Created guild config on message: ${message.guild?.name} (${message.guild?.id})`)
        }).catch((e) => err(`Failed to create guild config on message: ${message.guild?.name} (${message.guild?.id})`))
      }
    }
  },
} as Event<keyof ClientEvents>;
