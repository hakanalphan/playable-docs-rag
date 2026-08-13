import { sql } from "drizzle-orm"; // small set of aggregate queries, kept out of the repository class
import { db } from "../client";
import { documents, chunks, ingestionRuns, searchLogs } from "../schema";
import type { StatsResponse } from "@playable-rag/shared-types";

// Single query bundle behind GET /api/stats — one round trip for the whole dashboard
export async function getStats(): Promise<StatsResponse> {
  const [{ count: documentCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(documents);
  const [{ count: chunkCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(chunks);
  const [lastRun] = await db.select().from(ingestionRuns).orderBy(sql`${ingestionRuns.startedAt} desc`).limit(1);
  const [searchAgg] = await db
    .select({
      count: sql<number>`count(*)::int`,
      avgLatency: sql<number>`coalesce(avg(${searchLogs.totalMs}), 0)::float`,
      groundedRate: sql<number>`coalesce(avg(case when ${searchLogs.grounded} then 1 else 0 end), 0)::float`,
    })
    .from(searchLogs)
    .where(sql`${searchLogs.createdAt} > now() - interval '7 days'`);

  return {
    documentCount,
    chunkCount,
    lastIngestionAt: lastRun?.startedAt.toISOString() ?? null,
    lastIngestionStatus: lastRun?.status ?? null,
    searchCount7d: searchAgg.count,
    avgLatencyMs7d: searchAgg.avgLatency,
    groundedRate7d: searchAgg.groundedRate,
  };
}
