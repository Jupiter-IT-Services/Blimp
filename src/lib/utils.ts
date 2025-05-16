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
