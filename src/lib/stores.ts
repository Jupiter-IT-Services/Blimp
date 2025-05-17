import { Guild } from 'discord.js'
import { create } from 'zustand'

export const useGuildStore = create<{
    guild: Guild | null,
    setGuild: (guild: Guild | null) => void;
}>()((set) => ({
    guild: null,
    setGuild: (guild: Guild | null) => set(() => ({ guild: guild })),
}))
