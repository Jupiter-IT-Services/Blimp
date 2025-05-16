import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { guildConfig, GuildConfigSelect } from "../db/schema";
import { authClient } from "./client";

// export const loadGuilds = async () => {
//   const { accessToken } = await authClient.getAccessToken({
//     provider: "discord",
//   });
// };

export const inGuild = async (guildId: string) => {
  const data = await db
    .select()
    .from(guildConfig)
    .where(eq(guildConfig.id, guildId));
  if (!data || !data[0]) return null;
  return data[0] as GuildConfigSelect;
};
