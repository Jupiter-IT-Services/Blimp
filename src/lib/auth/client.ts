"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
// import { stripeClient } from "@better-auth/stripe/client";
import { auth } from "../auth";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    // TODO: UNDO AFTER BRING BACK IMPLEMENTATION
    // stripeClient({
    //   subscription: true,
    // }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
