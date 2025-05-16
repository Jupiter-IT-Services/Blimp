import type { Guild } from "discord.js";
import { app } from "..";
import config from "../config";

export const getGuild = () => {
  return app.guilds.cache.find((f) => f.id === config.guildId) as Guild;
};
