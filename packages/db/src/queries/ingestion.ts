import { eq, sql } from "drizzle-orm"; // powers the admin "Ingestion" history table
import { db } from "../client";
import { ingestionRuns } from "../schema";

// Called once at the start of `pnpm ingest` — row is visible in the dashboard immediately
export async function startIngestionRun(triggeredBy: "cli" | "admin") {
  const [row] = await db.insert(ingestionRuns).values({ triggeredBy }).returning();
  return row;
}

// Called once at the end, success or failure — never leaves a run stuck in "running"
export async function finishIngestionRun(
  id: string,
  result: {
    status: "succeeded" | "failed";
    documentsProcessed: number;
    chunksCreated: number;
    chunksUpdated: number;
    chunksDeleted: number;
    error?: string;
  },
) {
  await db.update(ingestionRuns).set({ ...result, finishedAt: new Date() }).where(eq(ingestionRuns.id, id));
}

export async function listIngestionRuns(limit = 20) {
  return db.select().from(ingestionRuns).orderBy(sql`${ingestionRuns.startedAt} desc`).limit(limit);
}
