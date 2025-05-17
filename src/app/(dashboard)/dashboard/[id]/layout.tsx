"use client";

import * as React from "react";

import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import { authClient } from "@/lib/auth/client";
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
    const setGuild = useGuildStore(s => s.setGuild)
    const getGuild = useGuildStore(s => s.guild)
    const { data: guild, isLoading, isError, isPending, error } = useQuery({
        queryKey: ["getGuilds", "dashboard"],
        queryFn: () => betterFetch<{
            ok: boolean,
            data: Guild
        }>(`${env.NEXT_PUBLIC_API_URL}/dash/guild/${id}`),
    });

    React.useEffect(() => {
        if (!getGuild && guild && guild.data) {
            setGuild(guild.data?.data as Guild)
        }
    }, [guild])

    const showSpinner = useSpinDelay(isLoading, { delay: 500, minDuration: 200 });
    if (showSpinner) return <Loader />

    if (isError) {
        return <ErrorView error={error} />
    }



    if (!guild) return <ForceHome />





    return (
        <>
            <Toaster />
            <div className="flex w-full">
                <GuildSidebar guild={guild.data?.data as Guild} />
                {children}
            </div>

        </>
    );
}
