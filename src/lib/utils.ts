import { ECommand } from "@/backend/api/dash";
import { clsx, type ClassValue } from "clsx";
import {
  RESTAPIPartialCurrentUserGuild,
  RESTGetAPICurrentUserGuildsResult,
} from "discord.js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasCapital(str: string) {
  return /[A-Z]/.test(str);
}

export function hasSymbol(str: string) {
  return /[^a-zA-Z0-9\s]/.test(str);
}

export type GuildDefault = RESTGetAPICurrentUserGuildsResult;
export type Guild = RESTAPIPartialCurrentUserGuild;
export type AvailableGuild = {
  available: boolean;
} & Guild;

export function sortGuildsByAvailable(
  items: GuildDefault,
  idArray: string[]
): AvailableGuild[] {
  const idSet = new Set(idArray);

  const itemsWithAvailability: AvailableGuild[] = items.map((item) => ({
    ...item,
    available: idSet.has(item.id),
  }));

  return [...itemsWithAvailability].sort((a, b) => {
    if (a.available && !b.available) {
      return -1;
    } else if (!a.available && b.available) {
      return 1;
    } else {
      return 0;
    }
  });
}

export function formatNameForAvatar(name: string) {
  return name.split(" ").slice(0, 2).map((z) => z.charAt(0).toUpperCase()).join("")
}

export const capitlize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

export type CommandSortResult = {
  enabled: string[],
  disabled: string[]
}

export function sortCommandsByStatus(commands: Record<string, ECommand[]>): CommandSortResult {
  const result: CommandSortResult = {
    enabled: [],
    disabled: []
  };

  for (const category in commands) {
    for (const command of commands[category]) {
      if (command.disabled) {
        result.disabled.push(command.name);
      } else {
        result.enabled.push(command.name);
      }
    }
  }

  return result;
}