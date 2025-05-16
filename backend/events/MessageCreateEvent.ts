import type { ClientEvents, Message } from "discord.js";
import type { Event } from "../core/typings";
import { app } from "..";

export default {
  name: "messageCreate",
  run: (message: Message) => {
    if (message.content.includes(`<@${app.user?.id}>`)) {
        
    }
  },
} as Event<keyof ClientEvents>;
