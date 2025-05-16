import {
  AvailableGuild,
  Guild,
  GuildDefault,
  sortGuildsByAvailable,
} from "@/lib/utils";
import { Card } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { AvatarFallback, AvatarImage, Avatar } from "../ui/avatar";
import { inGuild } from "@/lib/auth/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { betterFetch } from "@better-fetch/fetch";
import { env } from "@/env";
import Loader from "../loader";
import { toast } from "sonner";

export type GuildViewProps = {
  guilds: Guild[];
};
export default function GuildView(props: GuildViewProps) {
  const { data, isLoading, isError, isPending, error } = useQuery({
    queryKey: ["guilds", "checkIn"],
    queryFn: () =>
      betterFetch<{
        ok: boolean;
        data: string[]; //string of ids
      }>(`${env.NEXT_PUBLIC_API_URL}/dash/guilds/in/`, {
        method: "POST",
        body: {
          ids: props.guilds.map((g) => g.id),
        },
        onRequest: () => {},
        onError: () => {
          toast.error(
            "Failed to fetch guilds availbilty, please refresh to try again."
          );
        },
      }),
  });

  if (isLoading || !data) return <Loader />;
  const newGuilds = sortGuildsByAvailable(
    props.guilds,
    data?.data?.data as string[]
  );

  return (
    <div className="flex flex-wrap gap-[0.5rem] w-[70%]">
      {newGuilds.map((g, i) => (
        <GuildSingle {...g} key={i} />
      ))}
    </div>
  );
}

export type GuildSingleProps = AvailableGuild;
export function GuildSingle(props: GuildSingleProps) {
  return (
    <Card className="flex gap-[0.5rem] w-[45%] p-[1rem]">
      <div className="flex gap-1 items-center mb-[1rem]">
        <Avatar>
          <AvatarImage
            src={`https://cdn.discordapp.com/icons/${props.id}/${props.icon}.${props.icon?.startsWith("a_") ? "gif" : "png"}`}
            alt={`${props.name} server icon`}
            width={75}
            height={75}
          />
          <AvatarFallback>
            {props.name
              .split(" ")
              .map((z) => z.toUpperCase())
              .join("")}
          </AvatarFallback>
        </Avatar>
        <h1>{props.name}</h1>
      </div>

      <Button variant="red" className="cursor-pointer" asChild>
        <a
          href={
            props.available
              ? `/dashboard/${props.id}`
              : `https://discord.com/oauth2/authorize?client_id=1372669471377850458&permissions=8&integration_type=0&scope=bot+applications.commands&guild_id=${props.id}&disable_guild_select=true`
          }
        >
          {props.available ? "Configure" : "Add me"}
        </a>
      </Button>
    </Card>
  );
}
