import type { Guild } from "discord.js";
import { app } from "..";
import config from "../config";
import { db } from "@/lib/db";
import { guildConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export function updateDisabledCommands(
  currentDisabled: string[],
  enableList: string[],
  disableList: string[]
): string[] {
  const disabledSet = new Set(currentDisabled);

  for (const cmd of enableList) {
    if (disabledSet.has(cmd)) {
      disabledSet.delete(cmd);
    }
  }

  for (const cmd of disableList) {
    if (!disabledSet.has(cmd)) {
      disabledSet.add(cmd);
    }
  }

  return Array.from(disabledSet);
}

export async function getGuildConfig(id: string) {
  let d = await db.select().from(guildConfig).where(eq(guildConfig.id, id));
  if (!d || !d[0]) {
    await db
      .insert(guildConfig)
      .values({
        id: id,
      })
      .execute();

    d = await db.select().from(guildConfig).where(eq(guildConfig.id, id));
  }
  return d || d[0] ? d[0] : null;
}

export async function disabledCommand(name: string, guildId: string) {
  const config = await getGuildConfig(guildId);
  if (!config) return false;

  return config.disabledCommands.includes(name.toLowerCase());
}


