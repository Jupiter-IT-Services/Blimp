import ErrorView from "@/components/ErrorView";
import Loader from "@/components/loader";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { env } from "@/env";
import { ReactionRoleSelect } from "@/lib/db/schema";
import { useGuildStore, useWebsocket } from "@/lib/stores";
import { betterFetch } from "@better-fetch/fetch";
import { useQuery } from "@tanstack/react-query";
import { Guild, APIEmbed } from "discord.js";
import {
  APIGuildChannel,
  ChannelType,
  RESTGetAPIGuildRoleResult,
} from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { useSpinDelay } from "spin-delay";

import { createId, limitSentence } from "@/lib/utils";
import { toast } from "sonner";
import SaveChanges from "../SaveChanges";
import { ModuleProvider } from ".";
import EmbedCreator from "@/components/EmbedCreator";
import { Trash2 } from "lucide-react";

type GRole = RESTGetAPIGuildRoleResult;

export default function ReactionRolesNew() {
  const guild = useGuildStore((s) => s.guild) as unknown as Guild;
  const { ws } = useWebsocket((s) => s);
  const [roles, setRoles] = useState<GRole[]>([]);
  const [channels, setChannels] = useState<APIGuildChannel<ChannelType>[]>([]);
  const [embed, setEmbed] = useState<APIEmbed | null>(null);

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["getReactionRoles"],
    queryFn: () =>
      betterFetch<{
        ok: boolean;
        data: ReactionRoleSelect[];
        disabled: boolean;
      }>(`${env.NEXT_PUBLIC_API_URL}/dash/reaction-roles/${guild.id}`),
  });

  const { data: rawRoles } = useQuery({
    queryKey: ["getAllGuildRoles"],
    queryFn: () =>
      betterFetch<{
        ok: boolean;
        data: GRole[];
        disabled: boolean;
      }>(`${env.NEXT_PUBLIC_API_URL}/dash/guild/${guild.id}/roles`),
  });

  const { data: rawChannels } = useQuery({
    queryKey: ["getAllGuildChannels"],
    queryFn: () =>
      betterFetch<{
        ok: boolean;
        data: APIGuildChannel<ChannelType>[];
        disabled: boolean;
      }>(`${env.NEXT_PUBLIC_API_URL}/dash/guild/${guild.id}/channels`),
  });

  useEffect(() => {
    if (rawRoles?.data?.data) {
      setRoles(rawRoles.data.data as GRole[]);
    }
  }, [rawRoles, rawRoles?.data?.data]);

  useEffect(() => {
    if (rawChannels?.data?.data) {
      setChannels(
        (
          rawChannels.data.data as unknown as APIGuildChannel<ChannelType>[]
        ).filter((f) => f.type === ChannelType.GuildText)
      );
    }
  }, [rawChannels, rawChannels?.data?.data]);

  const { Component } = ModuleProvider({
    initalData: data?.data?.data,
    title: "Reaction Roles",
    description: "Manage and create/delete reaction roles for blimp.",
  });

  const showSpinner = useSpinDelay(isLoading, { delay: 3500 });
  if (showSpinner) return <Loader />;

  if (isError)
    return (
      <ErrorView error={error || new Error("Unable to find reaction roles.")} />
    );

  return (
    <Component className="flex flex-row gap-2 w-full">
      <Card className="min-w-[20%] h-full p-[1rem]">
        {data?.data?.data.map((rr, i) => (
          <div key={i} className="flex flex-row justify-between">
            <div className="w-full cursor-pointer  flex-row justify-between px-[0.7rem] group bg-transparent hover:bg-gray-200/5 py-[0.7rem] rounded-md smooth_transition flex gap-2 smooth_transition">
              {limitSentence(rr.message, 15)}
            </div>
            <div
              onClick={() => {
                betterFetch(
                  `${env.NEXT_PUBLIC_API_URL}/modules/reaction-roles/${rr.id}/${rr.uniqueId}`,
                  {
                    method: "DELETE",
                    onRequest: () => {
                      toast.info("Deleting reaciton role....");
                    },
                    onSuccess: () => {
                      toast.success("Deleted reaction role");
                      setTimeout(() => {
                        window.location.href = window.location.href;
                      }, 1500);
                    },
                    onError: (ctx) => {
                      toast.error("Failed to delete reaction role");
                      console.log(ctx.error.message);
                    },
                  }
                );
              }}
              className="group cursor-pointer group bg-transparent hover:bg-gray-200/5 p-[0.7rem] rounded-md smooth_transition flex gap-2 smooth_transition"
            >
              <Trash2 width={20} height={20} className="text-red-500" />
            </div>
          </div>
        ))}
        {data?.data?.data && data?.data?.data.length <= 0 && (
          <div className="flex flex-row justify-between px-[0.7rem] group text-sm  bg-gray-200/5 py-[0.7rem] rounded-md smooth_transition">
            <p className="opacity-50">Please create a reaction role first.</p>
          </div>
        )}
      </Card>
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-[-0.25rem]">
          <h1 className="font-bold">Create Reaction Role</h1>
          <p className="text-sm opacity-60">
            Please fill out the options below to create a reaction role.
          </p>
        </CardHeader>
        <CardContent>
          <EmbedCreator state={embed} setState={setEmbed} />
        </CardContent>
      </Card>
    </Component>
  );
}
