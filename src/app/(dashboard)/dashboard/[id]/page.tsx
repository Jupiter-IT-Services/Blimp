"use client";

import { useState } from "react";
import ForceHome from "@/components/auth/ForceHome";
import ErrorView from "@/components/ErrorView";
import Loader from "@/components/loader";
import { env } from "@/env";
import { useGuildStore } from "@/lib/stores";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar } from "@/components/Avatar";
import { Guild } from "discord.js";
import { Copy, Users, MessageSquare, Shield } from "lucide-react";

export default function DashboardView() {
  const { guild } = useGuildStore((s) => s);

  if (!guild) return <ForceHome href="/dashboard" />;
  
  // For debugging - log the guild structure
  console.log("Guild object:", JSON.stringify({
    id: guild.id,
    name: guild.name,
    memberCount: guild.memberCount,
    channelsType: typeof guild.channels,
    rolesType: typeof guild.roles,
    hasChannels: !!guild.channels,
    hasRoles: !!guild.roles,
  }));
  
  const memberCount = guild.memberCount || 0;
  
  const getCollectionCount = (obj: any, prop: string): number => {
    if (!obj || !obj[prop]) return 0;
    
    if (Array.isArray(obj[prop])) {
      return obj[prop].length;
    }
    
    return 0;
  };
  
  const channelCount = getCollectionCount(guild, 'channels');
  const roleCount = getCollectionCount(guild, 'roles');
  
  const copyServerId = () => {
    navigator.clipboard.writeText(guild.id);
    toast.success("Server ID copied to clipboard");
  };

  return (
    <div className="flex flex-col w-full p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <div className="flex-shrink-0">
          <Avatar 
            name={guild.name}
            id={guild.id}
            iconHash={guild.icon}
            size={96}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{guild.name}</h1>
            <Badge variant="outline" className="h-6 px-2 text-xs">
              {guild.id}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyServerId}
              className="h-7 px-2"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="sr-only">Copy ID</span>
            </Button>
          </div>
          <p className="text-muted-foreground mt-1">
            Server Overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> 
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{memberCount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> 
              Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{channelCount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> 
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{roleCount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server Information</CardTitle>
          <CardDescription>Additional details about your Discord server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p className="mt-1">
                {guild.createdTimestamp 
                  ? new Date(guild.createdTimestamp).toLocaleString() 
                  : "Unknown"}
                </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Region</h3>
              <p className="mt-1">{guild.preferredLocale || "Unknown"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Features</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {guild.features?.length > 0 ? (
                  guild.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No special features</span> // This is mainly just for failover :3 (though impossible to take effect (or effect idk the word))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
