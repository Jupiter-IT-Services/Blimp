import { ActivityType, Guild, type ClientEvents } from "discord.js";
import type { Event } from "../core/typings";
import { app } from "..";
import { info } from "../utils/logger";

export default {
  name: "ready",
  run: () => {
    app.user?.setActivity({
      name: "blimp • /help",
      state: "blimp • /help",
      type: ActivityType.Custom,
    });
  },
} as Event<keyof ClientEvents>;
