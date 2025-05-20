"use client";

import ForceHome from "@/components/auth/ForceHome";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { useSpinDelay } from "spin-delay";
import { useAvailableGuildStore, useUserStore } from "@/lib/stores";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";

export default function Dashboard() {
  const { data, isPending } = authClient.useSession();
  const { user } = useUserStore();
  const { guilds } = useAvailableGuildStore();
  
  const showSpinner = useSpinDelay(isPending, { delay: 500, minDuration: 200 });
  if (showSpinner) return <Loader />;
  if (!data) return <ForceHome />;
  
  return (
    <div className="flex flex-col w-full h-full p-8">
      <h1 className="text-2xl font-bold mb-6">Your Servers</h1>
      
      {!guilds || guilds.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20">
          <p className="text-center text-muted-foreground mb-2">No servers available to manage</p>
          <p className="text-center text-sm text-muted-foreground">Make sure you have admin permissions in your Discord servers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {guilds.map((guild) => (
            <Link href={`/dashboard/${guild.id}`} key={guild.id}>
              <Card className="hover:bg-accent/10 transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 mb-2 mt-4">
                    <Avatar 
                      name={guild.name}
                      id={guild.id}
                      iconHash={guild.icon}
                      size={64}
                    />
                  </div>
                  <h2 className="font-medium text-sm mt-2">{guild.name}</h2>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
