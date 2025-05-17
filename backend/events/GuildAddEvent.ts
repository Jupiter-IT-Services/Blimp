import type { ClientEvents, Guild, Message } from "discord.js";
import type { Event } from "../core/typings";
import { app } from "..";
import { guildConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { err, info } from "../utils/logger";

export default {
    name: "guildCreate",
    run: async (guild: Guild) => {
        // shouldnt have record but just incase
        const data = await db.select().from(guildConfig).where(eq(guildConfig.id, guild.id))
        if (!data || !data[0]) {
            await db.insert(guildConfig).values({
                id: guild.id,
            }).execute().then((d) => {
                info(`Joined guild: ${guild.name} (${guild.id})`)
            }).catch((e) => err(`Failed to create guild config on join: ${guild?.name} (${guild?.id})`))
        }
    },
} as Event<keyof ClientEvents>;
