"use client";

import { Command } from "@/backend/core/typings";
import ErrorView from "@/components/ErrorView";
import axios from "axios";
import Loader from "@/components/loader";
import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { env } from "@/env";
import { useGuildStore, useWebsocket } from "@/lib/stores";
import { betterFetch } from "@better-fetch/fetch";
import { useQuery } from "@tanstack/react-query";
import { Guild } from "discord.js";
import { useEffect, useState } from "react";
import { useSpinDelay } from "spin-delay";
import { Button } from "@/components/ui/button";
import { sortCommandsByStatus } from "@/lib/utils";
import { ECommand } from "@/backend/api/dash";
import { toast } from "sonner";
import { WSData, WSType } from "@/backend/ws";
import { Input } from "@/components/ui/input";

export type CommandsFetch = {
  ok: boolean;
  data: Record<string, ECommand[]>;
};

export default function Commands() {
  const guild = useGuildStore((s) => s.guild) as Guild;

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["getCommands"],
    queryFn: () =>
      betterFetch<CommandsFetch>(
        `${env.NEXT_PUBLIC_API_URL}/dash/commands/${guild.id}`
      ),
  });

  const initialCommandData = data?.data?.data as Record<string, ECommand[]>;

  useEffect(() => {
    const initialCommandData = data?.data?.data as Record<string, ECommand[]>;
    if (initialCommandData) {
      setSavedCommands(initialCommandData);
      setUpdatedCommands(initialCommandData);
    }
  }, [data?.data?.data]);

  const [savedCommands, setSavedCommands] = useState(initialCommandData);
  const [updatedCommands, setUpdatedCommands] = useState(initialCommandData);
  const [hasChanges, setHasChanges] = useState(false);
  const [search, setSearch] = useState("");

  const toggleCommandStatus = (category: string, commandName: string) => {
    const newCommands = JSON.parse(JSON.stringify(updatedCommands));

    const commandIndex = newCommands[category].findIndex(
      (cmd: ECommand) => cmd.name === commandName
    );
    if (commandIndex !== -1) {
      newCommands[category][commandIndex].disabled =
        !newCommands[category][commandIndex].disabled;
      setUpdatedCommands(newCommands);
    }
  };

  const resetChanges = () => {
    setUpdatedCommands(savedCommands);
  };

  const saveChanges = () => {
    setSavedCommands(updatedCommands);
    setHasChanges(false);

    const data = sortCommandsByStatus(updatedCommands);

    betterFetch<CommandsFetch>(
      `${env.NEXT_PUBLIC_API_URL}/dash/update-commands/${guild.id}`,
      {
        method: "POST",
        body: data,
        onSuccess: () => {
          toast.success(`Updated commands.`);
        },
        onError: () => {
          toast.error(`Failed to update commands.`);
        },
      }
    );
  };

  useEffect(() => {
    const changesDetected =
      JSON.stringify(savedCommands) !== JSON.stringify(updatedCommands);

    setHasChanges(changesDetected);
  }, [updatedCommands, savedCommands]);

  const showSpinner = useSpinDelay(isLoading, { delay: 3500 });
  if (showSpinner || !updatedCommands) return <Loader />;

  if (isError)
    return <ErrorView error={error || new Error("Unable to find commands.")} />;

  return (
    <div className="flex flex-col gap-3 mx-[2rem] my-[4.25rem] w-full">
      <Input
        placeholder="Search Commands"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Accordion
        className="w-full"
        type="multiple"
        defaultValue={Object.keys(
          data?.data?.data as Record<string, ECommand[]>
        )}
      >
        {Object.keys(data?.data?.data as Record<string, ECommand[]>).map(
          (cat, i) => {
            const cmds = (
              updatedCommands as unknown as Record<string, ECommand[]>
            )[cat as keyof typeof updatedCommands] as unknown as ECommand[];
            return (
              <AccordionItem className="w-full" value={cat} key={i}>
                <AccordionTrigger className="text-sm font-bold">
                  {cat.toUpperCase()}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2 my-[1rem]">
                  {cmds
                    .filter(
                      (f) =>
                        f.name.toLowerCase().includes(search.toLowerCase()) ||
                        f.description
                          .toLowerCase()
                          .includes(search.toLowerCase())
                    )
                    .map((cmd, i) => {
                      return (
                        <Card className="w-full h-fit flex flex-row justify-between items-center p-[1rem]">
                          <div className="flex flex-col items-start gap-1">
                            <h1 className="font-semibold text-md">
                              /{cmd.name}
                            </h1>
                            <p className="opacity-60 text-xs">
                              {cmd.description}
                            </p>
                          </div>
                          <div>
                            <Switch
                              className="cursor-pointer"
                              checked={!cmd.disabled}
                              onClick={() => {
                                toggleCommandStatus(cat, cmd.name);
                              }}
                            />
                          </div>
                        </Card>
                      );
                    })}
                </AccordionContent>
              </AccordionItem>
            );
          }
        )}
      </Accordion>

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
