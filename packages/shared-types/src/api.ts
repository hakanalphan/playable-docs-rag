import { z } from "zod"; // response contract for GET /api/stats, consumed by the dashboard

export const StatsResponseSchema = z.object({
  documentCount: z.number().int(),
  chunkCount: z.number().int(),
  lastIngestionAt: z.string().nullable(),
  lastIngestionStatus: z.enum(["running", "succeeded", "failed"]).nullable(),
  searchCount7d: z.number().int(),
  avgLatencyMs7d: z.number(),
  groundedRate7d: z.number(), // 0..1, share of answered queries that were grounded
});
export type StatsResponse = z.infer<typeof StatsResponseSchema>;
