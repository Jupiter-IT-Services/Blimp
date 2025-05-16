// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { db } from "@/lib/db";
// // import { account, session, user, verification } from "../db/schema";
// import { sendForgottenPasswordEmail } from "../email";
// import { bearer } from "better-auth/plugins";
// import { createClient } from "redis";
// import { env } from "@/env";

// const redis = createClient({
//   url: env.REDIS_URL,
// });
// await redis.connect();

// export const auth = betterAuth({
//   socialProviders: {
//     discord: {
//       clientId: env.DISCORD_CLIENT_ID as string,
//       clientSecret: env.DISCORD_CLIENT_SECRET as string,
//     },
//   },
//   session: {
//     cookieCache: {
//       enabled: true,
//       maxAge: 5 * 60,
//     },
//   },
//   database: drizzleAdapter(db, {
//     provider: "pg",
//     // schema: { user, session, account, verification },
//   }),
//   plugins: [bearer()],
//   emailAndPassword: {
//     enabled: true,
//     sendResetPassword: async ({ user, url, token }, request) => {
//       sendForgottenPasswordEmail(user.email, user.name, url);
//     },
//   },
// });


export * from "../auth"