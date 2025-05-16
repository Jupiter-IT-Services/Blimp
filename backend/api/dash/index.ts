import Elysia from "elysia";
import { app } from "../..";
import { z } from "zod";

const guildsSchema = z.object({
  ids: z.string().array(),
});
export const dash = new Elysia({
  prefix: "/dash",
})
  .post(`/guilds/in`, ({ body }) => {
    try {
      const data = guildsSchema.parse(body);
      const r = [];
      for (let i = 0; i < data.ids.length; i++) {
        const id = data.ids[i];
        const guild = app.guilds.cache.find((f) => f.id === id);
        if (guild) {
          r.push(guild.id);
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
  .get(`/guild/:id`, ({ params }) => {
    const guild = app.guilds.cache.find((f) => f.id === params.id);
    if (!guild) {
      return new Response(
        JSON.stringify({
          ok: false,
        }),
        {
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
      }),
      {
        status: 200,
      }
    );
  });
