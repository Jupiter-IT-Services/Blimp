import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // NODE_ENV: z.enum(["development", "test", "production"]),
    RESEND_API_KEY: z.string().optional(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),
    DATABASE_URL: z.string(),
    REDIS_URL: z.string().optional(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    // TODO: UNDO AFTER BRING BACK IMPLEMENTATION
    STRIPE_PRIVATE_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    API_PORT: z.string(),
    GUILD_ID: z.string(),
    WS_PORT: z.string(),
  },
  client: {
    NEXT_PUBLIC_URL: z.string().url(),
    // TODO: UNDO AFTER BRING BACK IMPLEMENTATION
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().optional(),
    NEXT_PUBLIC_API_URL: z.string(),
    NEXT_PUBLIC_WS_URL: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    API_PORT: process.env.API_PORT,
    GUILD_ID: process.env.GUILD_ID,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    WS_PORT: process.env.WS_PORT,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
});
