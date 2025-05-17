"use client";

import ForceHome from "@/components/auth/ForceHome";
import { GuildOverview } from "@/components/dashboard/GuildBoard";
import GuildSidebar from "@/components/dashboard/GuildSidebar";
import ErrorView from "@/components/ErrorView";
import Loader from "@/components/loader";
import { env } from "@/env";
import { betterFetch } from "@better-fetch/fetch";
import { useQuery } from "@tanstack/react-query";
import { Guild } from "discord.js";
import { useParams } from "next/navigation";
import { useSpinDelay } from "spin-delay";

export default function DashboardView() {
  const { id } = useParams<{ id: string }>();
  const { data: guild, isLoading, isError, isPending, error } = useQuery({
    queryKey: ["getGuilds", "dashboard"],
    queryFn: () => betterFetch<{
      ok: boolean,
      data: Guild
    }>(`${env.NEXT_PUBLIC_API_URL}/dash/guild/${id}`),
  });

  const showSpinner = useSpinDelay(isLoading, { delay: 500, minDuration: 200 });
  if (showSpinner) return <Loader />

  if (isError) {
    return <ErrorView error={error} />
  }

  if (!guild) return <ForceHome />


  return <div className="flex flex-row gap-[1.5rem]">
    {guild.data?.data.name}
  </div>;
}
