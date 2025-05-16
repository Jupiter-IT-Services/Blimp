import "dotenv/config";
import {
  ActivityType,
  Client,
  GatewayIntentBits,
  IntentsBitField,
  Partials,
  REST,
  Routes,
  type ApplicationCommandData,
  type ApplicationCommandDataResolvable,
  type ClientEvents,
  type GatewayIntentsString,
} from "discord.js";
import { file, Glob } from "bun";
import type { Command, Event } from "./typings";
import { err, info, success } from "../utils/logger";
import { api } from "../api";
import { env } from "@/env";
import { hostname } from "os";

export type CoreClientOptions = {
  clientId: string;
};

export default class CoreBot extends Client {
  commands: Map<string, Command> = new Map();
  opts: Partial<CoreClientOptions> = {};
  constructor() {
    super({
      intents: Object.keys(GatewayIntentBits).filter((f) =>
        isNaN(parseInt(f))
      ) as unknown as GatewayIntentBits[],
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User,
      ],
      allowedMentions: {
        repliedUser: true,
      },
    });
  }

  public init() {
    this.login(process.env.TOKEN);
    this.register();
    api.listen(
      {
        port: env.API_PORT,
        hostname: "0.0.0.0",
      },
      (a) => info(`API listening on  ${a.hostname}:${env.API_PORT}`)
    );
  }

  public register() {
    this.registerCommands();
    this.registerEvents();
  }
  private async registerCommands() {
    const commandList: ApplicationCommandDataResolvable[] = [];
    const filesGlob = new Glob(`**/*Command.ts`);

    const fileList = Array.from(
      filesGlob.scanSync({
        cwd: `./backend/commands`,
        onlyFiles: true,
      })
    );

    for (let i = 0; i < fileList.length; i++) {
      const filePwd = fileList[i];
      const data = (
        await import(`${process.cwd()}/backend/commands/${filePwd}`)
      )?.default as Command;
      if (!data.name) return;

      this.commands.set(data.name, data);
      commandList.push(data);
    }

    const rest = new REST().setToken(process.env.TOKEN!);
    if (!env.GUILD_ID) {
      info(`Registering commands globally.}`);
      rest
        .put(Routes.applicationCommands(this.opts.clientId!), {
          body: commandList,
        })
        .then((data) => {
          success(
            `Registered ${
              (data as unknown as Array<any>).length || 0
            } commands globally.`
          );
        })
        .catch(() => {
          err(`Failed to register commands globally.`, 0);
        });
    } else {
      info(`Registering commands in: ${env.GUILD_ID}`);
      rest
        .put(
          Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID!, env.GUILD_ID),
          {
            body: commandList,
          }
        )
        .then((data) => {
          success(
            `Registered ${
              (data as unknown as Array<any>).length || 0
            } commands in: ${env.GUILD_ID}`
          );
        })
        .catch((e) => {
          console.log(e);
          err(`Failed to register commands in: ${env.GUILD_ID}`, 0);
        });
    }
  }
  private async registerEvents() {
    const filesGlob = new Glob(`*Event.ts`);

    const fileList = Array.from(
      filesGlob.scanSync({
        cwd: `./backend/events`,
        onlyFiles: true,
      })
    );
    info(`Registering events`);
    for (let i = 0; i < fileList.length; i++) {
      const filePwd = fileList[i];
      const data = (await import(`${process.cwd()}/backend/events/${filePwd}`))
        ?.default as Event<keyof ClientEvents>;
      if (!data.name) return;
      success(`Registered event: ${data.name}`);
      this.on(data.name, data.run);
    }
  }
}
