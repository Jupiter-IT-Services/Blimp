"use client";

import * as React from "react";

import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import { authClient } from "@/lib/auth/client";
import { useSpinDelay } from 'spin-delay';
import Loader from "@/components/loader";
import ForceHome from "@/components/auth/ForceHome";


export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const { data, isPending } = authClient.useSession();

    const showSpinner = useSpinDelay(isPending, { delay: 500, minDuration: 200 });
    if (showSpinner || !data) return <Loader />
    return (
        <>
            <Toaster />
            <div className="flex">
                <Sidebar guilds={JSON.parse(data?.user.guilds)} {...data} />
                {children}
            </div>

        </>
    );
}
