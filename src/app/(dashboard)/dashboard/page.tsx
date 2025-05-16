"use client";

import GuildView from "@/components/dashboard/GuildView";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth/client";
import { Guild, GuildDefault } from "@/lib/utils";

export default function Dashboard() {
  const { data } = authClient.useSession();
  if (!data) return <Loader />;
  return (
    <div className="flex w-screen h-screen items-center justify-center">
      <GuildView guilds={JSON.parse(data.user.guilds)} />
    </div>
  );
}
