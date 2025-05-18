"use client";

import ForceHome from "@/components/auth/ForceHome";
import GuildView from "@/components/dashboard/GuildView";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth/client";
import { Guild, GuildDefault } from "@/lib/utils";
import { useSpinDelay } from "spin-delay";

export default function Dashboard() {
  const { data, isPending } = authClient.useSession();
  const showSpinner = useSpinDelay(isPending, { delay: 500, minDuration: 200 });
  if (showSpinner) return <Loader />;
  if (!data) return <ForceHome />;
  return (
    <div className="flex w-screen h-screen items-center justify-center"></div>
  );
}
