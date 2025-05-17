import {
  ActivityType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  type ApplicationCommandOptionData,
  type ChatInputApplicationCommandData,
  type ClientEvents,
} from "discord.js";
import type CoreBot from "./Core";

export type Command = {
  run: CommandRunFn;
  adminOnly?: boolean;
  usage: string[];
  category?: string;
  devOnly?: boolean;
} & ChatInputApplicationCommandData;

export type CommandRunFn = (opts: CommandRunFnOpts) => void;
export type CommandRunFnOpts = {
  client: CoreBot;
  args: CommandInteractionOptionResolver;
  ctx: ExtendedInteraction;
};
export interface ExtendedInteraction extends CommandInteraction {
  member: GuildMember;
}

export type Event<K extends keyof ClientEvents> = {
  name: K;
  run: (...args: ClientEvents[K]) => void;
};
