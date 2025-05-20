import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";
import { bearer } from "better-auth/plugins";
import { env } from "@/env";
import { nextCookies } from "better-auth/next-js";
import { DiscordProfile } from "./types";
import { betterFetch } from "@better-fetch/fetch";
import { GuildDefault } from "./utils";
// import { stripe } from "@better-auth/stripe";
// import Stripe from "stripe";

// const redis = createClient({
//   url: env.REDIS_URL,
// });

// const stripeClient = new Stripe(env.STRIPE_PRIVATE_KEY, {
//   apiVersion: "2025-02-24.acacia",
// });

// await redis.connect();

export const auth = betterAuth({
  user: {
    additionalFields: {
      guilds: {
        type: "string",
        defaultValue: [],
        required: true,
      },
    },
  },
  socialProviders: {
    discord: {
      clientId: env.DISCORD_CLIENT_ID as string,
      // redirectURI: `/dashboard`,
      clientSecret: env.DISCORD_CLIENT_SECRET as string,
      getUserInfo: async (token) => {
        const { data: profile, error } = await betterFetch<DiscordProfile>(
          "https://discord.com/api/users/@me",
          {
            headers: {
              authorization: `Bearer ${token.accessToken}`,
            },
          }
        );
        if (error || !profile) {
          return {
            user: { id: "", emailVerified: false },
            data: {},
          };
        }

        const { data: guilds, error: err } = await betterFetch<GuildDefault>(
          "https://discord.com/api/users/@me/guilds",
          {
            headers: {
              authorization: `Bearer ${token.accessToken}`,
            },
          }
        );

        const adminGuilds = guilds?.filter(
          (f) => (parseInt(f.permissions) & 0x20) == 0x20
        );

        return {
          user: {
            id: profile.id,
            name: profile.global_name || profile.username || "",
            email: profile.email,
            emailVerified: profile.verified,
            image: profile.image_url,
            guilds: JSON.stringify(adminGuilds),
          },
          data: profile,
        };
      },
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  plugins: [
    bearer(),
    nextCookies(),
  ],
});


