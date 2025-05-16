import { ActivityType, Guild, type ClientEvents } from "discord.js";
import type { Event } from "../core/typings";
import { app } from "..";
import { info } from "../utils/logger";

export const STATUES = [
  {
    name: () => `over ${app.users.cache.size} users`,
    type: ActivityType.Watching,
  },
  {
    name: () => `to requests @ jptr.cloud`,
    type: ActivityType.Listening,
  },
  {
    name: () => `for support tickets`,
    type: ActivityType.Watching,
  },
  {
    name: () => `for rule breakers`,
    type: ActivityType.Watching,
  },
] as {
  name: () => string;
  type: ActivityType;
}[];

export default {
  name: "ready",
  run: () => {
    let count = 0;
    let status = STATUES[count];
    app.user?.setActivity({
      name: status.name(),
      type: status.type,
      state: "online",
    });

    setInterval(
      () => {
        count += 1;
        if (count < STATUES.length - 1) {
          count = 0;
        }

        info(`Updated status, #${count} status`);

        let status = STATUES[count];
        app.user?.setActivity({
          name: status.name(),
          type: status.type,
          state: "online",
        });

        // 30 mins
      },
      1000 * 60 * 30
    );
  },
} as Event<keyof ClientEvents>;
