import { Guild } from "discord.js";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNameForAvatar } from "@/lib/utils";

export type GuildOverviewProps = {
  guild: Guild;
};

export function GuildOverview(props: GuildOverviewProps) {
  return (
    <Card className="w-[800px] flex flex-row items-center gap-4 p-[1rem]">
      <Avatar className="w-[65px] h-[65px]">
        <AvatarImage
          src={`https://cdn.discordapp.com/icons/${props.guild.id}/${props.guild.icon as string}.${(props.guild.icon as string).startsWith("a_") ? "gif" : "png"}?size=4096`}
          alt={`${props.guild.name} icon`}
          width={50}
          height={50}
        />
        <AvatarFallback>{formatNameForAvatar(props.guild.name)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-2xl">{props.guild.name}</h1>
        <p>TODO...</p>
      </div>
    </Card>
  );
}
