import Elysia from "elysia";

import { reactionRolesModule } from "./reaction-roles";

export const modules = new Elysia({
  prefix: "/modules",
}).use(reactionRolesModule);
