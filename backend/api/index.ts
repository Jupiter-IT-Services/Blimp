import Elysia from "elysia";
import { dash } from "./dash";
import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { modules } from "./modules";

export const api = new Elysia()
  .use(cors())
  .use(
    logger({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    })
  )
  .get(`/`, () => ({
    cookies: "with",
    milk: true,
  }))
  .use(dash)
  .use(modules);
