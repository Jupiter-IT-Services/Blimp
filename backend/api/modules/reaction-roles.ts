import Elysia from "elysia";
import { app } from "../..";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { guildConfig, reactionRole, ReactionRoleInsert } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { err, info } from "@/backend/utils/logger";
import { Command } from "@/backend/core/typings";
import { getGuildConfig, updateDisabledCommands } from "@/backend/utils/misc";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  Guild,
  TextChannel,
} from "discord.js";
import { createId } from "@/lib/utils";

export const reactionRolesModule = new Elysia({
  prefix: "/reaction-roles",
})
  .delete("/:id/:uid", async ({ params }) => {
    const data = await db
      .select()
      .from(reactionRole)
      .where(
        and(
          eq(reactionRole.id, params.id),
          eq(reactionRole.uniqueId, params.uid)
        )
      );
    if (!data)
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Unable to find reaction role.",
        }),
        {
          status: 400,
        }
      );

    const guild = app.guilds.cache.find((f) => f.id === data[0].id) as Guild;
    if (guild) {
      const channel = guild.channels.cache.find(
        (f) => f.id === data[0].channelId && f.type === ChannelType.GuildText
      ) as TextChannel;
      if (channel) {
        (await channel.messages.fetch(data[0].messageId as string))
          .delete()
          .catch((e) => null);
      }
    }
    return await db
      .delete(reactionRole)
      .where(
        and(
          eq(reactionRole.id, params.id),
          eq(reactionRole.uniqueId, params.uid)
        )
      )
      .catch(() => {
        return new Response(
          JSON.stringify({
            ok: false,
            message: "Failed to delete reaction role, please try again.",
          }),
          {
            status: 500,
          }
        );
      })
      .then(() => {
        return new Response(
          JSON.stringify({
            ok: true,
            message: "Reaction role deleted.",
          }),
          {
            status: 200,
          }
        );
      });
  })
  .post(`/:id`, async ({ params, body }) => {
    const rrCreateSchema = z.object({
      guildId: z.string(),
      channelId: z.string(),
      message: z.string(),
      roles: z
        .object({
          label: z.string(),
          roleId: z.string(),
          style: z.number(),
          emoji: z.string().nullable(),
        })
        .array(),
    });

    try {
      const data = rrCreateSchema.parse(body);

      const guild = app.guilds.cache.find((f) => f.id == data.guildId);
      if (!guild)
        return new Response(
          JSON.stringify({
            ok: false,
            message: "Unable to find guild.",
          }),
          {
            status: 400,
          }
        );

      const channel = guild.channels.cache.find(
        (f) => f.id === data.channelId && f.type === ChannelType.GuildText
      ) as TextChannel;
      if (!channel)
        return new Response(
          JSON.stringify({
            ok: false,
            message: "Unable to find channel.",
          }),
          {
            status: 400,
          }
        );
      const uId = createId();

      const msg = await channel.send({
        content: data.message,
        components: [
          new ActionRowBuilder<ButtonBuilder>({
            type: ComponentType.ActionRow,
            components: data.roles.map(
              (r) =>
                new ButtonBuilder({
                  label: r.label,
                  custom_id: `${data.guildId}_reaction_role_${uId}_${r.roleId}`,
                  style: r.style
                    ? (r.style as unknown as ButtonStyle)
                    : ButtonStyle.Success,
                })
            ),
          }),
        ],
      });

      await db
        .insert(reactionRole)
        .values({
          channelId: data.channelId,
          id: data.guildId,
          uniqueId: uId,
          message: data.message,
          messageId: msg.id,
          reactions: data.roles.map((r) => JSON.stringify(r)),
        })
        .execute()
        .catch((e) => {
          return new Response(
            JSON.stringify({
              ok: false,
              message: "Failed to create reaction role.",
            }),
            {
              status: 500,
            }
          );
        });

      return new Response(
        JSON.stringify({
          ok: true,
          message: "Reaction created.",
        }),
        {
          status: 200,
        }
      );
    } catch (e) {
      const err = e as ZodError;
      return new Response(
        JSON.stringify({
          ok: false,
          message: err.message,
        }),
        {
          status: 500,
        }
      );
    }
  });
