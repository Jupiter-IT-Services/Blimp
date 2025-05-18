import ErrorView from "@/components/ErrorView";
import Loader from "@/components/loader";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { env } from "@/env";
import { ReactionRoleSelect } from "@/lib/db/schema";
import { useGuildStore, useWebsocket } from "@/lib/stores";
import { betterFetch } from "@better-fetch/fetch";
import { useQuery } from "@tanstack/react-query";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Guild, RoleData } from "discord.js";
import {
  APIGuildChannel,
  ButtonStyle,
  ChannelType,
  RESTGetAPIGuildRoleResult,
} from "discord-api-types/v10";
import { Cross, Plus, SmilePlus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSpinDelay } from "spin-delay";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createId, limitSentence } from "@/lib/utils";
import { toast } from "sonner";

type GRole = RESTGetAPIGuildRoleResult;

export default function ReactionRoles() {
  const guild = useGuildStore((s) => s.guild) as unknown as Guild;
  const { ws } = useWebsocket((s) => s);
  const [roles, setRoles] = useState<GRole[]>([]);
  const [channels, setChannels] = useState<APIGuildChannel<ChannelType>[]>([]);

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

  useEffect(() => {
    const initialData = data?.data?.data;
    if (initialData) {
      setCurrentReactionRoles(initialData);
      setUpdatedReactionRoles(initialData);
      setDisabledModule(data.data?.disabled);
    }
  }, [data?.data?.data]);

  const [currentReactionRoles, setCurrentReactionRoles] =
    useState<ReactionRoleSelect[]>();
  const [updatedReactionRoles, setUpdatedReactionRoles] =
    useState<ReactionRoleSelect[]>();
  const [hasChanges, setHasChanged] = useState(false);
  const [disabledModule, setDisabledModule] = useState(data?.data?.disabled);

  useEffect(() => {
    const changesDetected =
      JSON.stringify(currentReactionRoles) !==
        JSON.stringify(updatedReactionRoles) ||
      disabledModule !== data?.data?.disabled;

    setHasChanged(changesDetected);
  }, [currentReactionRoles, updatedReactionRoles, disabledModule]);

  const resetChanges = () => {
    setUpdatedReactionRoles(currentReactionRoles);
    setHasChanged(false);
  };

  const saveChanges = () => {
    setCurrentReactionRoles(updatedReactionRoles);
    setHasChanged(false);
  };

  const showSpinner = useSpinDelay(isLoading, { delay: 3500 });
  if (showSpinner || !updatedReactionRoles) return <Loader />;

  if (isError)
    return (
      <ErrorView error={error || new Error("Unable to find reaction roles.")} />
    );

  return (
    <div className="flex flex-col gap-3 mx-[2rem] my-[4.25rem] w-full">
      <div className="flex flex-row justify-between gap-3 w-full">
        <h1 className="font-bold text-2xl">Reaction Roles</h1>
        <Button
          variant={disabledModule ? "secondary" : "destructive"}
          className="cursor-pointer"
          onClick={() => {
            setDisabledModule(!disabledModule);
          }}
        >
          {disabledModule ? "Enable" : "Disable"}
        </Button>
      </div>

      <div className="flex flex-col gap-3 my-5">
        {data?.data?.data.map((reactionRole, i) => (
          <Card
            key={i}
            className="flex flex-row items-center justify-between p-4 rounded-md"
          >
            <h1 className="font-semibold ">
              {limitSentence(reactionRole.message)}
            </h1>

            <Button
              className="cursor-pointer"
              onClick={() => {
                betterFetch(
                  `${env.NEXT_PUBLIC_API_URL}/modules/reaction-roles/${reactionRole.id}/${reactionRole.uniqueId}`,
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
              variant={"destructive"}
            >
              <Trash2 />
              Delete
            </Button>
          </Card>
        ))}

        <Card className="flex flex-row items-center justify-between p-4 rounded-md">
          <h1 className="font-semibold text-sm opacity-70">
            Create new reaction role
          </h1>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant={"red"} className="cursor-pointer">
                Create
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="min-w-[500px]">
              <AlertDialogTitle className="font-bold text-lg ">
                Create new reaction role
              </AlertDialogTitle>
              <CreateReactionRole
                guildId={guild.id}
                channels={channels}
                ws={ws as WebSocket}
                roles={roles}
              />
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>

      <motion.div
        initial={{
          y: 20,
          opacity: 0,
        }}
        animate={{
          y: hasChanges ? 0 : 20,
          opacity: hasChanges ? 1 : 0,
        }}
        className="fixed top-[85%] z-[5] bottom-0 left-[38.5%] right-0 w-[40%] h-[3rem]"
      >
        <Card className="flex flex-row justify-between p-[1rem] items-center">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold">Changes Detected</h1>
            <p className="opacity-70 text-sm">
              Make sure to save your changes before quitting.
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <Button
              variant={"red"}
              className="cursor-pointer"
              onClick={() => saveChanges()}
            >
              Save Changes
            </Button>
            <Button
              variant={"secondary"}
              className="cursor-pointer"
              onClick={() => resetChanges()}
            >
              Reset
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

type R = {
  label: string;
  emoji: string | null;
  style: number;
  roleId: string;
  tempId?: string;
};

type CreateReactionRoleProps = {
  roles: GRole[];
  ws: WebSocket;
  channels: APIGuildChannel<ChannelType>[];
  guildId: string;
};

function CreateReactionRole(props: CreateReactionRoleProps) {
  const [message, setMessage] = useState("");
  const [channelId, setChannelId] = useState("");
  const [openEmoji, setOpenEmoji] = useState<R | null>(null);
  const [roles, setRoles] = useState<R[]>([]);
  const [validation, setValidation] = useState({
    channel: false,
    message: false,
  });

  const updateRole = (updatedRole: R, newData: Partial<R>) => {
    const updatedRoles = roles.map((r) => {
      if (r.tempId === updatedRole.tempId) {
        return { ...r, ...newData };
      }
      return r;
    });

    setRoles(updatedRoles);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (!message) {
          setValidation({
            ...validation,
            message: false,
          });
          toast.error("Please provide a message.");
          return;
        } else {
          setValidation({
            ...validation,
            message: true,
          });
        }

        if (!channelId) {
          setValidation({
            ...validation,
            channel: false,
          });
          toast.error("Please provide a channel.");
          return;
        } else {
          setValidation({
            ...validation,
            channel: true,
          });
        }

        if (!validation["message"]) {
          toast.error("Please provide a message.");
          return;
        }

        if (!validation["channel"]) {
          toast.error("Please provide a channel.");
          return;
        }

        if (
          roles.filter(
            (f) =>
              !f.roleId ||
              f.roleId.length <= 0 ||
              !f.label ||
              f.label.length <= 0
          ).length > 0
        ) {
          toast.error("Please provide atleast one role.");
          return;
        }

        const r = roles.map((r) => {
          delete r.tempId;
          return r;
        });

        betterFetch(
          `${env.NEXT_PUBLIC_API_URL}/modules/reaction-roles/${props.guildId}`,
          {
            method: "POST",
            body: {
              guildId: props.guildId,
              channelId: channelId,
              message: message,
              roles: r,
            },
            onRequest: () => {
              toast.info("Creating reaction...");
            },
            onError: (ctx) => {
              toast.error("Failed to create reaction.");
              console.log(ctx.error.message);
            },
            onSuccess: () => {
              toast.success("Reaction role created.");
              setTimeout(() => {
                window.location.href = window.location.href;
              }, 1500);
            },
          }
        );
      }}
    >
      <div className="flex w-full flex-col gap-2 mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="uppercase font-semibold text-xs opacity-70">
            Message
          </h1>
          <Textarea
            className={`w-full ${validation["message"] ? "border-green-500/30" : "border-red-500/30"}`}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);

              if (!message || e.target.value.length <= 0) {
                setValidation({
                  ...validation,
                  message: false,
                });
              } else {
                setValidation({
                  ...validation,
                  message: true,
                });
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-2 mt-[0.25rem]">
          <h1 className="uppercase font-semibold text-xs opacity-70">
            channel
          </h1>
          <Select
            onValueChange={(v) => {
              setChannelId(v);
              setValidation({
                ...validation,
                channel: true,
              });
            }}
          >
            <SelectTrigger className="mb-[1rem]">
              <SelectValue placeholder="Where do you want the message sent?" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {props.channels.map((r, i) => (
                  <SelectItem key={i} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="uppercase font-semibold text-xs opacity-70">
            Role buttons
          </h1>
          {roles.map((r, i) => (
            <div className="flex flex-row justify-between gap-2 w-full" key={i}>
              <div className="flex flex-row gap-1 w-full">
                <Popover open={openEmoji === r}>
                  <PopoverTrigger
                    onClick={() => setOpenEmoji(openEmoji === r ? null : r)}
                    asChild
                  >
                    <Card className="w-fit h-fit p-1 rounded-md">
                      {r.emoji ? (
                        <span className="cursor-pointer">{r.emoji}</span>
                      ) : (
                        <SmilePlus className="cursor-pointer" />
                      )}
                    </Card>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit h-fit bg-transparent border-none">
                    <EmojiPicker
                      onEmojiClick={(e) => {
                        updateRole(r, {
                          emoji: e.emoji,
                        });
                      }}
                      className="bg-transparent"
                      theme={Theme.DARK}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  className={`w-[70%]   ${r.label ? "border-green-500/30" : "border-red-500/30"}`}
                  value={r.label}
                  onChange={(e) => {
                    updateRole(r, {
                      label: e.target.value,
                    });
                  }}
                />
                <Select
                  onValueChange={(v) =>
                    updateRole(r, {
                      roleId: v,
                    })
                  }
                >
                  <SelectTrigger
                    className={`${r.roleId ? "border-green-500/30" : "border-red-500/30"} min-w-[40%] max-w-[40%]`}
                  >
                    <SelectValue
                      className={`${r.roleId ? "border-green-500/30" : "border-red-500/30"}`}
                      placeholder="Select role"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {props.roles.map((r, i) => (
                        <SelectItem key={i} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Card
                className="w-fit h-fit p-1 rounded-md cursor-pointer"
                onClick={() => {
                  setRoles(roles.filter((role) => role.tempId !== r.tempId));
                }}
              >
                <Trash2 className="text-red-500 opacity-40 hover:opacity-100 smooth_transition " />
              </Card>
            </div>
          ))}

          <Button
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              if (roles.length >= 5) {
                toast.error("Maximum of 5 allowed per message.");
                return;
              }
              setRoles([
                ...roles,
                {
                  tempId: createId(),
                  emoji: null,
                  label: "",
                  roleId: "",
                  style: ButtonStyle.Success,
                },
              ]);
            }}
            variant={"secondary"}
          >
            <Plus />
          </Button>
        </div>
      </div>
      <Button type="submit" variant={"red"}>
        Create
      </Button>
    </form>
  );
}
