import { info } from "../utils/logger";
import listeners, { ListnerNames } from "../listeners";

export enum WSType {
  EventEmit = 0,
}

export type WSData = {
  [WSType.EventEmit]: { eventName: ListnerNames };
};

export default () => {
  Bun.serve({
    port: 3002,
    hostname: "0.0.0.0",
    fetch(req, server) {
      const u = server.upgrade(req);

      if (u) {
        info("Websocket started. 0.0.0.0:3002");
        return;
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
      message: (ws, message) => {
        const d = JSON.parse(message as string) as {
          type: WSType;
          data: WSData[WSType];
          guildId: string;
        };

        console.log(d, d.type === WSType.EventEmit);

        if (d.type === WSType.EventEmit) {
          const name = d.data.eventName;
          const m = listeners[name];
          if (m) {
            m.run(d.guildId);
          }
        }
      },
    },
  });
};
