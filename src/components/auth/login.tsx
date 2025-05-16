"use client";

import { FaDiscord } from "react-icons/fa";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { env } from "@/env";

export default function LoginComponent() {
  useEffect(() => {
    (async () => {
      const data = await authClient.getSession();
      if (data && data.data) {
        return redirect("/dashboard");
      }
    })();
  }, []);
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="flex max-w-[500px] items-center justify-center">
        <Button
          onClick={() => {
            authClient.signIn.social(
              {
                provider: "discord",
                callbackURL: `${env.NEXT_PUBLIC_URL}/dashboard`,
                scopes: ["guilds", "identify"],
                fetchOptions: {},
              },
              {
                onRequest: () => {
                  toast.info("Signing in.");
                },
                onSuccess: () => {
                  toast.success("Signed in, redirecting soon.");
                },
                //@ts-ignore
                onError: (ctx) => {
                  toast.error(
                    "Failed to sign you in. If you're a nerd, the logs are in the console."
                  );
                  console.log(ctx);
                },
              }
            );
          }}
          variant={"red"}
          className="flex gap-3 items-center justify-center cursor-pointer"
        >
          <FaDiscord />
          Login With Discord
        </Button>
      </div>
    </div>
  );
}
