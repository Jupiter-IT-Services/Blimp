import {
  Attachment,
  Guild,
  InteractionReplyOptions,
  InteractionResponse,
  Message,
  MessagePayload,
  resolveColor,
  User,
} from "discord.js";
import {
  MessageResponse,
  Module,
  ModuleBooleanFn,
  moduleValid,
  ModuleValidation,
} from "..";
import CoreBot from "@/backend/core/Core";
import { Command, ExtendedInteraction } from "@/backend/core/typings";
import { defaultEmbeds, Embed } from "@/backend/core/Embed";
import config from "@/backend/config";
import { infraction, InfractionSelect } from "@/lib/db/schema";
import { createId } from "@/lib/utils";
import { db } from "@/lib/db";
import { SQL, Placeholder } from "drizzle-orm";

export default class Moderation {
  constructor() {}

  public async warn(guild: Guild) {
    return new WarningSystem(guild);
  }

  public async ban(guild: Guild) {
    return new BanSystem(guild);
  }
}

export type BanSystemLogic = {
  user: User;
  reason: string;
  silent: boolean | null;
  proof: Attachment | null;
  history: number | null;
  ctx: ExtendedInteraction;
  client: CoreBot;
};

export class BanSystem extends Module {
  guild: Guild;
  constructor(guild: Guild) {
    super();
    this.guild = guild;
  }

  public async logic({
    ...data
  }: BanSystemLogic): Promise<InteractionReplyOptions | MessagePayload> {
    const history:
      | unknown[]
      | SQL<unknown>
      | Placeholder<string, any>
      | null
      | undefined = [];
    if (data.history && data.history > 0) {
      let messageHistoryLength = data.history > 24 ? 24 : data.history;
      let messageHistory = await data.ctx.channel?.messages.fetch({
        limit: 100,
      });

      let lastMessageId = null;

      while (history.length < messageHistoryLength) {
        const userMessages = messageHistory
          ?.filter((f) => f.author.id === data.user.id)
          .toJSON()
          .slice(0, 24) as Message<boolean>[];

        history.push(
          ...userMessages.map((z) => ({
            id: z.id,
            content: z.content,
            time: z.createdTimestamp,
            edited: z.editedTimestamp,
            reference: z.reference,
          }))
        );

        if (userMessages.length < 24) {
          break;
        }

        lastMessageId = userMessages[userMessages.length - 1]?.id || undefined;

        messageHistory = await data.ctx.channel?.messages.fetch({
          limit: 100,
          before: lastMessageId,
        });
      }
    }

    const uId = createId(15);

    //@ts-ignore
    return this.guild.members.cache
      .find((f) => f.id === data.user.id)
      ?.ban({
        reason: data.reason,
        deleteMessageSeconds: 60 * 60 * 15,
      })
      .then(async () => {
        return (await db
          .insert(infraction)
          .values({
            type: "ban",
            guildId: data.ctx.guild?.id as string,
            reason: data.reason,
            moderatorId: data.ctx.user.id,
            userId: data.user.id,
            id: uId,
            silenced: data.silent,
            proofUrl: data.proof?.url || null,
            history: history.length > 0 ? history : null,
          })
          .execute()
          .then(() => {
            return {
              flags: data.silent ? ["Ephemeral"] : [],
              embeds: [
                new Embed({
                  color: resolveColor(config.colors.success),
                  description: `${config.emojis.tick} Banned: <@${data.user.id}> *(@${data.user.username})*\n${config.emojis.mod} Moderator: <@${data.ctx.user.id}>`,
                  fields: [
                    {
                      name: "Options",
                      value: `>>> ${moduleValid(data.silent, "Silenced?")}\n ${moduleValid(data.history, "History Saved?")}\n ${moduleValid(data.proof, "Proof Attached?")}`,
                    },
                    {
                      name: "Reason",
                      value: `*${data.reason}*`,
                    },
                  ],
                  footer: {
                    text: `Case ID: #${uId}`,
                  },
                }),
              ],
            } as MessageResponse;
          })
          .catch(() => {
            return {
              flags: data.silent ? ["Ephemeral"] : [],
              embeds: [
                new Embed({
                  color: resolveColor(config.colors.error),
                  description: `${config.emojis.cross} Failed to ban <@${data.user.id}>.`,
                }),
              ],
            } as MessageResponse;
          })) as MessageResponse;
      })
      .catch(() => {
        return {
          flags: data.silent ? ["Ephemeral"] : [],
          embeds: [
            new Embed({
              color: resolveColor(config.colors.error),
              description: `${config.emojis.cross} Failed to ban <@${data.user.id}>.`,
            }),
          ],
        } as MessageResponse;
      });
  }

  public valid(cases: ModuleBooleanFn[]): ModuleValidation {
    let v = false;

    for (let i = 0; i < cases.length; i++) {
      const c = cases[i];
      if (!c()) {
        v = false;
        break;
      } else {
        v = true;
      }
    }

    return (cmd: Command, client: CoreBot) => ({
      value: v,
      response: {
        flags: ["Ephemeral"],
        embeds: [defaultEmbeds["missing-values"](cmd, client)],
      },
    });
  }
}

export type WarningSystemLogic = {
  user: User;
  reason: string;
  silent: boolean | null;
  permanant: boolean | null;
  proof: Attachment | null;
  history: number | null;
  ctx: ExtendedInteraction;
  client: CoreBot;
};

export class WarningSystem extends Module {
  guild: Guild;
  constructor(guild: Guild) {
    super();
    this.guild = guild;
  }

  public async logic({
    ...data
  }: WarningSystemLogic): Promise<InteractionReplyOptions | MessagePayload> {
    const history = [];
    if (data.history && data.history > 0) {
      let messageHistoryLength = data.history > 24 ? 24 : data.history;
      let messageHistory = await data.ctx.channel?.messages.fetch({
        limit: 100,
      });

      let lastMessageId = null;

      while (history.length < messageHistoryLength) {
        const userMessages = messageHistory
          ?.filter((f) => f.author.id === data.user.id)
          .toJSON()
          .slice(0, 24) as Message<boolean>[];

        history.push(
          ...userMessages.map((z) => ({
            id: z.id,
            content: z.content,
            time: z.createdTimestamp,
            edited: z.editedTimestamp,
            reference: z.reference,
          }))
        );

        if (userMessages.length < 24) {
          break;
        }

        lastMessageId = userMessages[userMessages.length - 1]?.id || undefined;

        messageHistory = await data.ctx.channel?.messages.fetch({
          limit: 100,
          before: lastMessageId,
        });
      }
    }

    const uId = createId(15);
    return await db
      .insert(infraction)
      .values({
        type: "warn",
        guildId: data.ctx.guild?.id as string,
        reason: data.reason,
        moderatorId: data.ctx.user.id,
        userId: data.user.id,
        id: uId,
        permanent: data.permanant,
        silenced: data.silent,
        proofUrl: data.proof?.url || null,
        history: history.length > 0 ? history : null,
      })
      .execute()
      .then(() => {
        return {
          flags: data.silent ? ["Ephemeral"] : [],
          embeds: [
            new Embed({
              color: resolveColor(config.colors.success),
              description: `${config.emojis.tick} Warned: <@${data.user.id}> *(@${data.user.username})*\n${config.emojis.mod} Moderator: <@${data.ctx.user.id}>`,
              fields: [
                {
                  name: "Options",
                  value: `>>> ${moduleValid(data.silent, "Silenced?")}\n ${moduleValid(data.permanant, "Permanant?")}\n ${moduleValid(data.history, "History Saved?")}\n ${moduleValid(data.proof, "Proof Attached?")}`,
                },
                {
                  name: "Reason",
                  value: `*${data.reason}*`,
                },
              ],
              footer: {
                text: `Case ID: #${uId}`,
              },
            }),
          ],
        } as MessageResponse;
      })
      .catch(() => {
        return {
          flags: data.silent ? ["Ephemeral"] : [],
          embeds: [
            new Embed({
              color: resolveColor(config.colors.error),
              description: `${config.emojis.cross} Failed to warn <@${data.user.id}>.`,
            }),
          ],
        } as MessageResponse;
      });
  }

  public valid(cases: ModuleBooleanFn[]): ModuleValidation {
    let v = false;

    for (let i = 0; i < cases.length; i++) {
      const c = cases[i];
      if (!c()) {
        v = false;
        break;
      } else {
        v = true;
      }
    }

    return (cmd: Command, client: CoreBot) => ({
      value: v,
      response: {
        flags: ["Ephemeral"],
        embeds: [defaultEmbeds["missing-values"](cmd, client)],
      },
    });
  }
}
