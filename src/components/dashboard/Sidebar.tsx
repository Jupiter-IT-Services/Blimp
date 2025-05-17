import {
  formatNameForAvatar,
  GuildDefault,
  sortGuildsByAvailable,
} from "@/lib/utils";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Card } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Loader from "../loader";
import { env } from "@/env";
import { betterFetch } from "@better-fetch/fetch";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Session, User } from "better-auth";
import { useSpinDelay } from "spin-delay";
import ForceHome from "../auth/ForceHome";

export type SidebarProps = {
  guilds: GuildDefault;
  user: User;
  session: Session;
};
export default function Sidebar(props: SidebarProps) {
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

  const showSpinner = useSpinDelay(isLoading, { delay: 500, minDuration: 200 });
  if (showSpinner) return <Loader />;
  if (!data) return <ForceHome />;
  const newGuilds = sortGuildsByAvailable(
    props.guilds,
    data?.data?.data as string[]
  );

  return (
    <Card className="flex rounded-none h-screen flex-col gap-2 py-[2rem] px-[0.75rem]">
      <a href="/dashboard">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="mb-[1rem] border-b border-b-card-foreground/20 pb-[1rem]">
              <Avatar className="w-[45px] h-[45px] flex items-center cursor-pointer justify-center bg-default-accent">
                {props.user.image && (
                  <AvatarImage
                    src={`${props.user.image}?size=4096`}
                    alt={`${props.user.name} icon`}
                    width={25}
                    height={25}
                  />
                )}
                <AvatarFallback>
                  {formatNameForAvatar(props.user.name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Home</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </a>

      {newGuilds.map((g, i) => (
        <a
          key={i}
          href={
            g.available
              ? `/dashboard/${g.id}`
              : `https://discord.com/oauth2/authorize?client_id=1372669471377850458&permissions=8&integration_type=0&scope=bot+applications.commands&guild_id=${g.id}&disable_guild_select=true`
          }
          className="cursor-pointer"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="w-[45px] h-[45px] flex items-center cursor-pointer justify-center bg-default-accent">
                  {g.icon && (
                    <AvatarImage
                      src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon as string}.${(g.icon as string).startsWith("a_") ? "gif" : "png"}?size=4096`}
                      alt={`${g.name} icon`}
                      width={25}
                      height={25}
                    />
                  )}
                  <AvatarFallback>{formatNameForAvatar(g.name)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{g.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </a>
      ))}
    </Card>
  );
}
