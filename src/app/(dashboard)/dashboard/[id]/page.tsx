"use client";

import ForceHome from "@/components/auth/ForceHome";
import GuildSidebar from "@/components/dashboard/GuildSidebar";
import ErrorView from "@/components/ErrorView";
import Loader from "@/components/loader";
import { env } from "@/env";
import { useGuildStore } from "@/lib/stores";
import { betterFetch } from "@better-fetch/fetch";
import { useQuery } from "@tanstack/react-query";
import { Guild } from "discord.js";
import { useParams } from "next/navigation";
import { useSpinDelay } from "spin-delay";

export default function DashboardView() {
  const { guild } = useGuildStore((s) => s);

  if (!guild) return <ForceHome href={`/dashboard/${(guild as unknown as Guild).id}`} />;

  return <div className="flex flex-row gap-[1.5rem]">{guild.name}</div>;
}
