import postgres from "postgres"; // low-level driver, wrapped once here so nobody else touches it directly
import { drizzle } from "drizzle-orm/postgres-js"; // Drizzle's postgres-js adapter
import { dbEnv } from "./env";
import * as schema from "./schema";

const client = postgres(dbEnv.DATABASE_URL, { max: 10 }); // small pool, fine for a two-day case
export const db = drizzle(client, { schema }); // exported instance, imported by every query/repository file
