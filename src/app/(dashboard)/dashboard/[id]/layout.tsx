"use client";

import * as React from "react";

import { Toaster } from "@/components/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import Loader from "@/components/loader";
import GuildSidebar from "@/components/dashboard/GuildSidebar";
import ForceHome from "@/components/auth/ForceHome";
import ErrorView from "@/components/ErrorView";
import { env } from "@/env";
import { Guild } from "discord.js";
import { betterFetch } from "@better-fetch/fetch";
import { useParams } from "next/navigation";
import { useGuildStore } from "@/lib/stores";
import { useSpinDelay } from "spin-delay";

export default function GuildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { id } = useParams<{ id: string }>();
  const { setGuild, guild: storedGuild } = useGuildStore();
  const [loading, setLoading] = React.useState(true);

  const { isError, error, mutateAsync } = useMutation({
    mutationKey: ["getGuilds", "dashboard", id],
    mutationFn: () =>
      betterFetch<{
        ok: boolean;
        data: Guild;
      }>(`${env.NEXT_PUBLIC_API_URL}/dash/guild/${id}`),
  });

  
  React.useEffect(() => {
    if (!storedGuild) {
      mutateAsync()
        .then((response) => {
          if (response?.data?.data) {
            setGuild(response.data.data as Guild);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch guild:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, storedGuild, mutateAsync, setGuild]);

  const showSpinner = useSpinDelay(loading, { delay: 500, minDuration: 200 });

  if (showSpinner) return <Loader />;

  if (isError) {
    return <ErrorView error={error} />;
  }

  if (!storedGuild) return <ForceHome />;

  return (
    <>
      <Toaster />
      <div className="flex w-full">
        <GuildSidebar guild={storedGuild as Guild} />
        {children}
      </div>
    </>
  );
}
