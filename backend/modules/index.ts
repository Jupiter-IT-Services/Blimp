import {
  InteractionReplyOptions,
  InteractionResponse,
  Message,
  MessagePayload,
  resolveColor,
} from "discord.js";
import { defaultEmbeds, Embed } from "@/backend/core/Embed";
import config from "../config";
import { Command } from "../core/typings";
import CoreBot from "../core/Core";

export type ModuleValidation = (...any: any) => {
  value: boolean;
  response: InteractionReplyOptions | MessagePayload;
};

export type ModuleBooleanFn = () => boolean;
export type MessageResponse = InteractionReplyOptions | MessagePayload;

export abstract class Module {
  public cleanUp(message: InteractionResponse<boolean>, time = 2500): void {
    const t = setTimeout(() => {
      message.delete();
      clearTimeout(t);
    }, time);
  }

  public valid(cases: ModuleBooleanFn[]): ModuleValidation {
    return (cmd: Command, client: CoreBot) => ({
      value: false,
      response: {
        flags: ["Ephemeral"],
        embeds: [defaultEmbeds["missing-values"](cmd, client)],
      },
    });
  }

  public async logic(
    data: any
  ): Promise<InteractionReplyOptions | MessagePayload> {
    return {
      embeds: [
        new Embed({
          title: "Missing Logic",
          color: resolveColor(config.colors.error),
          description: `${config.emojis.cross} It appears that this command is missing its logic? Please try again later.`,
        }),
      ],
    };
  }
}

export function moduleValid(value: any, message: string) {
  return value
    ? `${config.emojis.tick} ${message}`
    : `${config.emojis.cross} ${message}`;
}
