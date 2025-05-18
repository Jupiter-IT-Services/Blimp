import { Guild } from "discord.js";
import { create } from "zustand";
import { Session, User } from "./auth/client";

export const useGuildStore = create<{
  guild: Guild | null;
  setGuild: (guild: Guild | null) => void;
}>()((set) => ({
  guild: null,
  setGuild: (guild: Guild | null) => set(() => ({ guild: guild })),
}));

export const useUserStore = create<{
  user: User | null;
  session: Session | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}>()((set) => ({
  user: null,
  session: null,
  setUser: (user: User | null) => set(() => ({ user })),
  setSession: (session: Session | null) => set(() => ({ session })),
}));

export const useWebsocket = create<{
  ws: WebSocket | null;
  setWebsocket: (ws: WebSocket | null) => void;
}>()((set) => ({
  ws: null,
  setWebsocket: (ws: WebSocket | null) => set(() => ({ ws: ws })),
}));
