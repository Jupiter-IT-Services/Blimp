"use client";

import * as React from "react";

import { Toaster } from "@/components/ui/sonner";
import { authClient, Session } from "@/lib/auth/client";
import { useSpinDelay } from "spin-delay";
import Loader from "@/components/loader";
import ForceHome from "@/components/auth/ForceHome";
import { useAvailableGuildStore, useUserStore } from "@/lib/stores"; // Assuming this import path
import { betterFetch } from "@better-fetch/fetch";
import { useMutation } from "@tanstack/react-query";
import { env } from "@/env";
import { Guild } from "discord.js";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, session, setUser, setSession } = useUserStore();
  const { guilds, setGuilds } = useAvailableGuildStore();
  const [loading, setLoading] = React.useState(true);

  const { data: sessionData, isPending } = authClient.useSession();

  const { isError, error, mutateAsync } = useMutation({
    mutationKey: ["getGuilds", "dashboard"],
    mutationFn: (guilds: string[]) =>
      betterFetch<{
        ok: boolean;
        data: string[];
      }>(`${env.NEXT_PUBLIC_API_URL}/dash/guilds/in/`, {
        method: "POST",
        body: {
          ids: guilds,
        },
        onRequest: () => {},
        onError: () => {
          toast.error(
            "Failed to fetch guilds availbilty, please refresh to try again."
          );
        },
      }),
  });

  React.useEffect(() => {
    if (sessionData && !session) {
      setSession(sessionData.session as unknown as Session);
      if (sessionData.user && !user) {
        setUser(sessionData.user);
        mutateAsync(
          (JSON.parse(sessionData.user.guilds) as Guild[]).map((z) => z.id)
        ).then((r) => {
          setGuilds(r.data?.data as unknown as Guild[]);
        });
      }
      setLoading(false);
    } else if (session) {
      setLoading(false);
    }
  }, [sessionData, session, user, setSession, setUser]);

  //   React.useEffect(() => {
  //     if (!guilds) {
  //       guildAMutateAsync()
  //         .then((response) => {
  //           if (response?.data?.data) {
  //             setGuilds(response.data.data as unknown as Guild[]);
  //           }
  //         })
  //         .catch((err) => {
  //           console.error("Failed to fetch guilds:", err);
  //         })
  //         .finally(() => {
  //           setLoading(false);
  //         });
  //     } else {
  //       setLoading(false);
  //     }
  //   }, [error, isError]);

  const effectiveSession =
    user && session ? { user: user, session: session } : sessionData;

  const showSpinner = useSpinDelay(loading || isPending, {
    delay: 500,
    minDuration: 200,
  });

  if (showSpinner) return <Loader />;

  if (!effectiveSession) return <ForceHome />;

  return (
    <>
      <Toaster />
      <div className="flex h-screen">{children}</div>
    </>
  );
}
