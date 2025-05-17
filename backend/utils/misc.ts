import type { Guild } from "discord.js";
import { app } from "..";
import config from "../config";


export function updateDisabledCommands(
  currentDisabled: string[],
  enableList: string[],
  disableList: string[]
): string[] {
  const disabledSet = new Set(currentDisabled);

  for (const cmd of enableList) {
    if (disabledSet.has(cmd)) {
      disabledSet.delete(cmd);
    }
  }

  for (const cmd of disableList) {
    if (!disabledSet.has(cmd)) {
      disabledSet.add(cmd);
    }
  }

  return Array.from(disabledSet);
}