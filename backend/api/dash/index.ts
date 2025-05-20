import Elysia from "elysia";
import { app } from "../..";
import { stringify } from "flatted";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { guildConfig, reactionRole } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { err, info } from "@/backend/utils/logger";
import { Command } from "@/backend/core/typings";
import { getGuildConfig, updateDisabledCommands } from "@/backend/utils/misc";

export type ECommand = Omit<Command, "run"> & {
  disabled: true;
  run: null;
};
const guildsSchema = z.object({
  ids: z.string().array(),
});
export const dash = new Elysia({
  prefix: "/dash",
})
  .get(`/guild/:id/channels`, ({ params }) => {
    const guild = app.guilds.cache.find((f) => f.id === params.id);
    if (!guild) {
      return new Response(
        JSON.stringify({
          ok: false,
          data: null,
        }),
        {
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: guild.channels.cache.toJSON(),
      }),
      {
        status: 200,
      }
    );
  })
  .post(`/guilds/in`, ({ body }) => {
    try {
      const data = guildsSchema.parse(body);
      const r = [];
      for (let i = 0; i < data.ids.length; i++) {
        const id = data.ids[i];
        const guild = app.guilds.cache.find((f) => f.id === id);
        if (guild) {
          r.push(guild);
        }
      }

      return new Response(
        JSON.stringify({
          ok: true,
          data: r,
        }),
        {
          status: 200,
        }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Failed to check servers.",
        }),
        {
          status: 400,
        }
      );
    }
  })
  .get(`/guild/:id/role/:roleId`, ({ params }) => {
    const { id, roleId } = params;
    const guild = app.guilds.cache.find((f) => f.id === params.id);
    if (!guild) {
      return new Response(
        JSON.stringify({
          ok: false,
          data: null,
        }),
        {
          status: 200,
        }
      );
    }

    const role = guild.roles.cache.find((f) => f.id === roleId);
    if (!role) {
      return new Response(
        JSON.stringify({
          ok: false,
          data: null,
        }),
        {
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: role,
      }),
      {
        status: 200,
      }
    );
  })
  .get(`/guild/:id/roles`, ({ params }) => {
    const guild = app.guilds.cache.find((f) => f.id === params.id);
    if (!guild) {
      return new Response(
        JSON.stringify({
          ok: false,
          data: null,
        }),
        {
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: guild.roles.cache
          .toJSON()
          .filter((f) => !f.managed && f.id !== guild.id),
      }),
      {
        status: 200,
      }
    );
  })
  .get(`/guild/:id`, ({ params }) => {
    const guild = app.guilds.cache.find((f) => f.id === params.id);
    if (!guild) {
      return new Response(
        JSON.stringify({
          ok: false,
          data: null,
        }),
        {
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: guild,
      }),
      {
        status: 200,
      }
    );
  })
  .get(`/commands/:id`, async ({ params }) => {
    //@ts-ignore
    const commandArray: Record<string, ECommand[]> = {};
    let guildConf = await db
      .select()
      .from(guildConfig)
      .where(eq(guildConfig.id, params.id));

    if (!guildConf) {
      await db
        .insert(guildConfig)
        .values({ id: params.id })
        .execute()
        .then((r) => info(`Created guild config on dashboard req.`))
        .catch((e) =>
          err(`Failed to create guild config on dashboard request.`)
        );
    }
    guildConf = await db
      .select()
      .from(guildConfig)
      .where(eq(guildConfig.id, params.id));

    if (!guildConf[0])
      return new Response(
        JSON.stringify({
          ok: false,
          data: null,
        }),
        {
          status: 500,
        }
      );

    app.commands.forEach((cmd) => {
      let d = false;
      if (guildConf[0].disabledCommands.includes(cmd.name.toLowerCase())) {
        d = true;
      }

      const c = {
        ...cmd,
        run: null,
        disabled: d,
      } as ECommand;
      if (Object.keys(commandArray).includes(cmd.category as string)) {
        commandArray[cmd.category as keyof typeof commandArray].push(c);
      } else {
        commandArray[cmd.category as keyof typeof commandArray] = [c];
      }
    });

    return new Response(
      JSON.stringify({
        ok: true,
        //@ts-ignore
        data: commandArray,
      })
    );
  })
  .post(`/update-commands/:id`, async ({ params, body }) => {
    const { id } = params;
    const bodySchema = z.object({
      disabled: z.string().array(),
      enabled: z.string().array(),
    });

    const guild = await app.guilds.cache.find((f) => f.id === id);
    if (!guild)
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Guild not found.",
        }),
        {
          status: 200,
        }
      );

    const currentConfig = await db
      .select()
      .from(guildConfig)
      .where(eq(guildConfig.id, id));
    if (!currentConfig || !currentConfig[0])
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Guild config not found.",
        }),
        {
          status: 200,
        }
      );

    try {
      const data = bodySchema.parse(body);

      const updated_commands = updateDisabledCommands(
        currentConfig[0].disabledCommands,
        data.enabled,
        data.disabled
      );
      return await db
        .update(guildConfig)
        .set({
          disabledCommands: updated_commands,
        })
        .where(eq(guildConfig.id, id))
        .then(() => {
          info(`Updated disalbed commands: ${id}`);
          return new Response(
            JSON.stringify({
              ok: true,
              message: "Commands updated",
            }),
            {
              status: 200,
            }
          );
        })
        .catch((e) => {
          err(`Failed to update disabled commands.`);
          return new Response(
            JSON.stringify({
              ok: false,
              message: "Failed to update commands.",
            }),
            {
              status: 500,
            }
          );
        });
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
  })
 