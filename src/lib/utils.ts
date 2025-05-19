import { ECommand } from "@/backend/api/dash";
import config from "@/backend/config";
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
export const urlRegex =
  /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;
export const imageUrlRegex =
  /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?\.(?:jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i;
export const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

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
  return name
    .split(" ")
    .slice(0, 2)
    .map((z) => z.charAt(0).toUpperCase())
    .join("");
}

export const capitlize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export type CommandSortResult = {
  enabled: string[];
  disabled: string[];
};

export function sortCommandsByStatus(
  commands: Record<string, ECommand[]>
): CommandSortResult {
  const result: CommandSortResult = {
    enabled: [],
    disabled: [],
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

export const createId = (length: number = 40) => {
  let str = "";
  let chars =
    "1234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm---";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};

export function limitSentence(str: string, length: number = 25) {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

// Taken from discord.js source code
// since it fails to run in client-side
// https://github.com/discordjs/discord.js/blob/14.19.3/packages/discord.js/src/util/Util.js#L284

const Colors = {
  Default: 0x000000,
  White: 0xffffff,
  Aqua: 0x1abc9c,
  Green: 0x57f287,
  Blue: 0x3498db,
  Yellow: 0xfee75c,
  Purple: 0x9b59b6,
  LuminousVividPink: 0xe91e63,
  Fuchsia: 0xeb459e,
  Gold: 0xf1c40f,
  Orange: 0xe67e22,
  Red: 0xed4245,
  Grey: 0x95a5a6,
  Navy: 0x34495e,
  DarkAqua: 0x11806a,
  DarkGreen: 0x1f8b4c,
  DarkBlue: 0x206694,
  DarkPurple: 0x71368a,
  DarkVividPink: 0xad1457,
  DarkGold: 0xc27c0e,
  DarkOrange: 0xa84300,
  DarkRed: 0x992d22,
  DarkGrey: 0x979c9f,
  DarkerGrey: 0x7f8c8d,
  LightGrey: 0xbcc0c0,
  DarkNavy: 0x2c3e50,
  Blurple: 0x5865f2,
  Greyple: 0x99aab5,
  DarkButNotBlack: 0x2c2f33,
  NotQuiteBlack: 0x23272a,
};

export function resolveColor(color: string) {
  let resolvedColor;

  if (typeof color === "string") {
    if (color === "Random") return Math.floor(Math.random() * (0xffffff + 1));
    if (color === "Default") return 0;
    if (/^#?[\da-f]{6}$/i.test(color))
      return parseInt(color.replace("#", ""), 16);
    resolvedColor = Colors[color as keyof typeof Colors];
  } else if (Array.isArray(color)) {
    resolvedColor = (color[0] << 16) + (color[1] << 8) + color[2];
  } else {
    resolvedColor = color;
  }

  if (!Number.isInteger(resolvedColor)) {
    return resolveColor(config.colors.default);
  }

  if (resolvedColor < 0 || resolvedColor > 0xffffff) {
    return resolveColor(config.colors.default);
  }

  return resolvedColor;
}
