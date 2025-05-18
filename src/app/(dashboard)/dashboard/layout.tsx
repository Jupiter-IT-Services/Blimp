"use client";

import * as React from "react";

import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/dashboard/Sidebar";
import { authClient, Session } from "@/lib/auth/client";
import { useSpinDelay } from 'spin-delay';
import Loader from "@/components/loader";
import ForceHome from "@/components/auth/ForceHome";
import { useUserStore } from "@/lib/stores"; // Assuming this import path

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, session, setUser, setSession } = useUserStore();
    const [loading, setLoading] = React.useState(true);

    const { data: sessionData, isPending } = authClient.useSession({
        enabled: !session
    });

    React.useEffect(() => {
        if (sessionData && !session) {
            setSession(sessionData.session as unknown as Session);
            if (sessionData.user && !user) {
                setUser(sessionData.user);
            }
            setLoading(false);
        } else if (session) {
            setLoading(false);
        }
    }, [sessionData, session, user, setSession, setUser]);

    const effectiveSession = user && session ? { user: user, session: session } : sessionData;

    const showSpinner = useSpinDelay(loading || isPending, { delay: 500, minDuration: 200 });

    if (showSpinner) return <Loader />;

    if (!effectiveSession) return <ForceHome />;

    return (
        <>
            <Toaster />
            <div className="flex">
                <Sidebar
                    guilds={JSON.parse(effectiveSession.user?.guilds)}
                    {...effectiveSession}
                />
                {children}
            </div>
        </>
    );
}