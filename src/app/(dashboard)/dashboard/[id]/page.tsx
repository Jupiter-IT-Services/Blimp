"use client";

import Loader from "@/components/loader";
import { env } from "@/env";
import { betterFetch } from "@better-fetch/fetch";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function DashboardView() {
  const { id } = useParams<{ id: string }>();
  const { data: guild, isLoading, isError, isPending, error } = useQuery({
    queryKey: ["getGuilds", "dashboard"],
    queryFn: () => betterFetch(`${env.NEXT_PUBLIC_API_URL}/dash/guilds/${id}`),
  });

  if(isLoading) return <Loader/>

  return <div>{JSON.stringify(guild)}</div>;
}
