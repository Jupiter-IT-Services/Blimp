"use client";

import { FaDiscord } from "react-icons/fa";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { env } from "@/env";
import Loader from "../loader";
import { useSpinDelay } from "spin-delay";

export default function LoginComponent() {
  const [loading, setLoading] = useState(false)
  const { data, isPending, error } = authClient.useSession();
  useEffect(() => {
    if (data && data.user && data.session) {
      return redirect("/dashboard");
    }
  }, [data]);

  const showSpinner = useSpinDelay(isPending, { delay: 500, minDuration: 200 });
  if(showSpinner) return <Loader/>
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
