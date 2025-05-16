import { env } from "@/env";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schemas from "./schema";

const sql = postgres(env.DATABASE_URL!);

export const db = drizzle(sql, {
  schema: { ...schemas },
});
