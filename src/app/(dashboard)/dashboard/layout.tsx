"use client";

import * as React from "react";

import { Toaster } from "@/components/ui/sonner";
import { authClient, Session } from "@/lib/auth/client";
import { useSpinDelay } from "spin-delay";
import Loader from "@/components/loader";
import ForceHome from "@/components/auth/ForceHome";
import { useAvailableGuildStore, useUserStore } from "@/lib/stores";
import { betterFetch } from "@better-fetch/fetch";
import { useMutation } from "@tanstack/react-query";
import { env } from "@/env";
import { Guild } from "discord.js";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatNameForAvatar } from "@/lib/utils";

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
        data: any[];
      }>(`${env.NEXT_PUBLIC_API_URL}/dash/guilds/in/`, {
        method: "POST",
        body: {
          ids: guilds,
        },
        onRequest: () => {
          console.log("Sending request to /dash/guilds/in/ with IDs:", guilds);
        },
        onError: (error) => {
          console.error("API request failed:", error);
          toast.error(
            "Failed to fetch guilds availability, please refresh to try again."
          );
        },
      }),
  });

  React.useEffect(() => {
    if (sessionData && !session) {
      setSession(sessionData.session as unknown as Session);
      if (sessionData.user && !user) {
        setUser(sessionData.user);
        try {
          // Parse guild data from session
          const guildData = JSON.parse(sessionData.user.guilds);
          console.log("Parsed guild data:", guildData);
          
          // Extract just the IDs regardless of format
          const guildIds = Array.isArray(guildData) 
            ? guildData.map(g => typeof g === 'string' ? g : g.id)
            : [];
            
          console.log("Guild IDs to send:", guildIds);
          
          // Only proceed if we have IDs
          if (guildIds.length > 0) {
            mutateAsync(guildIds)
              .then((r) => {
                console.log("API response:", r);
                if (r.data?.data) {
                  setGuilds(r.data.data as unknown as Guild[]);
                } else {
                  console.error("No guild data in response");
                }
              })
              .catch((error) => {
                console.error("API call failed:", error);
              });
          } else {
            console.warn("No guild IDs found to send to API");
            setLoading(false);
          }
        } catch (err) {
          console.error("Error parsing guild data:", err);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
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

  const displayUser = user || (sessionData?.user ? sessionData.user : null);

  return (
    <>
      <Toaster />
      <div className="flex flex-col h-screen">
        {}
        {displayUser && (
          <div className="flex justify-end p-4 bg-background/60 backdrop-blur-sm border-b">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{displayUser.name || 'User'}</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={sessionData?.user.image || undefined} alt={displayUser.name || 'User'} /> 
                <AvatarFallback className="text-xs">
                  {displayUser.name ? formatNameForAvatar(displayUser.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}

// This file needs to have the user avatar component fixed, but I'm having no luck with it.