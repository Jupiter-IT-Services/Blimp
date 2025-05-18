import reactionRoles from "./reaction-roles";


export type ListnerNames = "reaction-roles";

export type Listner = {
  name: ListnerNames;
  run: (guildId: string) => void;
};

export default {
  "reaction-roles": reactionRoles,
} as Record<ListnerNames, Listner>;
