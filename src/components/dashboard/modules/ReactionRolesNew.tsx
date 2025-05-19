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
  ButtonStyle,
  ChannelType,
  RESTGetAPIGuildRoleResult,
} from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { useSpinDelay } from "spin-delay";

import { capitlize, cn, createId, limitSentence } from "@/lib/utils";
import { toast } from "sonner";
import SaveChanges from "../SaveChanges";
import { ModuleProvider } from ".";
import EmbedCreator, { LabledInput } from "@/components/EmbedCreator";
import { Plus, SmilePlus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactionRoleInput } from "@/lib/types";

type GRole = RESTGetAPIGuildRoleResult;

export default function ReactionRolesNew() {
  const guild = useGuildStore((s) => s.guild) as unknown as Guild;
  const [roles, setRoles] = useState<GRole[]>([]);
  const [channels, setChannels] = useState<APIGuildChannel<ChannelType>[]>([]);
  const [role, setRole] = useState<GRole>();

  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [embed, setEmbed] = useState<APIEmbed | undefined>();
  const [channelId, setChannelId] = useState<string>("");
  const [name, setName] = useState<string>("");

  const [roleButtons, setRoleButtons] = useState<ReactionRoleInput[]>([]);

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

  const updateRoleButton = (
    updatedRoleButton: ReactionRoleInput,
    newData: Partial<ReactionRoleInput>
  ) => {
    const updatedRoles = roleButtons.map((r) => {
      if (r.tempId === updatedRoleButton.tempId) {
        return { ...r, ...newData };
      }
      return r;
    });

    setRoleButtons(updatedRoles);
  };

  const showSpinner = useSpinDelay(isLoading, { delay: 3500 });
  if (showSpinner) return <Loader />;

  if (isError)
    return (
      <ErrorView error={error || new Error("Unable to find reaction roles.")} />
    );

  return (
    <div
      className={cn(
        "mx-[2rem] w-full h-[95%] my-[2.25rem] flex flex-col gap-3"
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl">{capitlize("Reaction Roles")}</h1>
        <p className="opacity-60 text-sm">
          {"Manage and create/delete reaction roles for blimp."}
        </p>
      </div>
      <div className={cn("w-full h-full flex flex-row gap-2")}>
        <Card className="min-w-[20%] h-full p-[1rem]">
          {data?.data?.data.map((rr, i) => (
            <div key={i} className="flex flex-row justify-between">
              <div className="w-full cursor-pointer flex-row justify-between px-[0.7rem] group bg-transparent hover:bg-gray-200/5 py-[0.7rem] rounded-md smooth_transition flex gap-2">
                {limitSentence(rr.message, 15)}
              </div>
              <div
                onClick={() => {
                  betterFetch(
                    `${env.NEXT_PUBLIC_API_URL}/modules/reaction-roles/${rr.id}/${rr.uniqueId}`,
                    {
                      method: "DELETE",
                      onRequest: () => {
                        toast.info("Deleting reaction role....");
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
                className="group cursor-pointer group bg-transparent hover:bg-gray-200/5 p-[0.7rem] rounded-md smooth_transition flex gap-2"
              >
                <Trash2 width={20} height={20} className="text-red-500" />
              </div>
            </div>
          ))}
          {data?.data?.data && data?.data?.data.length <= 0 && (
            <div className="flex flex-row justify-between px-[0.7rem] group text-sm bg-gray-200/5 py-[0.7rem] rounded-md">
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
          <CardContent className="flex flex-col justify-start gap-2 h-full">
            <div className="flex flex-row gap-2 mb-[1rem]">
              <LabledInput
                label="Name"
                placeHolder="Set a reaction role name."
                className="w-[80%]"
                value={name}
                setValue={setName}
              />
              <div className={"flex flex-col gap-1 w-[20%]"}>
                <p className="uppercase text-xs opacity-60 font-semibold">
                  Channel
                </p>
                <Select
                  onValueChange={(v) => {
                    setChannelId(v);
                  }}
                >
                  <SelectTrigger className="w-full">
                    {channelId
                      ? channels.find((f) => f.id === channelId)?.name
                      : "Select a channel."}
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel, index) => {
                      return (
                        <SelectItem value={channel.id} key={index}>
                          {channel.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Tabs defaultValue="message">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger className="cursor-pointer" value="message">
                  Message
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="embed">
                  Embed
                </TabsTrigger>
              </TabsList>
              <TabsContent className="h-full" value="message">
                <Textarea
                  value={message}
                  className="min-h-[200px]"
                  onChange={(e) => setMessage(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="embed">
                <EmbedCreator setState={setEmbed} state={embed} />
              </TabsContent>
            </Tabs>
            <div className="flex flex-col gap-3 mt-[2rem]">
              <div className="flex flex-col gap-[-0.25rem]">
                <h1 className="font-bold">Reaction Buttons</h1>
                <p className="text-sm opacity-60">
                  Create buttons linking to roles below.
                </p>
              </div>

              {roleButtons.map((roleButton, i) => (
                <div className="flex flex-row gap-2" key={i}>
                  <Popover modal={true} open={emojiPickerOpen}>
                    <PopoverTrigger
                      onClick={() => setEmojiPickerOpen(true)}
                      asChild
                    >
                      <Card className="p-[0.5rem] rounded-md cursor-pointer">
                        {roleButton.emoji ? (
                          <p className="h-[17px] w-[17px] flex items-center justify-center">
                            {roleButton.emoji}
                          </p>
                        ) : (
                          <SmilePlus width={17} height={17} />
                        )}
                      </Card>
                    </PopoverTrigger>
                    <PopoverContent
                      onInteractOutside={() => setEmojiPickerOpen(false)}
                      className="w-full  h-full"
                    >
                      <EmojiPicker
                        onEmojiClick={(e) => {
                          setEmojiPickerOpen(false);
                          updateRoleButton(roleButton, {
                            emoji: e.emoji,
                          });
                        }}
                        className="bg-transparent"
                        theme={Theme.DARK}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    placeholder="Button Label"
                    value={roleButton.label}
                    onChange={(e) => {
                      updateRoleButton(roleButton, {
                        label: e.target.value,
                      });
                    }}
                  />
                  <Select
                    onValueChange={(v) => {
                      updateRoleButton(roleButton, {
                        roleId: v,
                      });
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a role." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role, i) => (
                        <SelectItem key={i} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={(v) => {
                      updateRoleButton(roleButton, {
                        style: parseInt(v),
                      });
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <p>
                        {roleButton.style
                          ? ButtonStyle[roleButton.style]
                          : "Select a style"}
                      </p>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"1"}>
                        <Button className="bg-[#5865f2] hover:bg-[#5865f2] text-white">
                          Primary
                        </Button>
                      </SelectItem>
                      <SelectItem value={"2"}>
                        <Button className="bg-[#4f545c] hover:bg-[#4f545c] text-white">
                          Secondary
                        </Button>
                      </SelectItem>
                      <SelectItem value={"3"}>
                        <Button className="bg-[#43b581] hover:bg-[#43b581] text-white">
                          Success
                        </Button>
                      </SelectItem>
                      <SelectItem value={"4"}>
                        <Button className="bg-[#f04747] hover:bg-[#f04747] text-white">
                          Destructive
                        </Button>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="cursor-pointer"
                    variant={"red"}
                    onClick={() => {
                      setRoleButtons(
                        roleButtons.filter(
                          (f) => f.tempId !== roleButton.tempId
                        )
                      );
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}

              <Button
                onClick={() => {
                  setRoleButtons([
                    ...roleButtons,
                    {
                      label: "",
                      roleId: "",
                      style: ButtonStyle.Success,
                      emoji: undefined,
                      tempId: createId(),
                    },
                  ]);
                }}
                variant={"secondary"}
                className="cursor-pointer"
              >
                Create New Role Button <Plus />
              </Button>
            </div>

            <Button variant={"red"} className="cursor-pointer">
              Send Reaction Role
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
