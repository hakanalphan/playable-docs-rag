import { z } from "zod"; // shared across admin dashboard, API routes, and ingestion

export const DocumentStatusSchema = z.enum(["indexed", "pending", "failed", "deleted"]);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

// Row shown in the admin "Documents" table
export const DocumentSummarySchema = z.object({
  id: z.string(),
  sourcePath: z.string(),
  title: z.string(),
  status: DocumentStatusSchema,
  chunkCount: z.number().int(),
  updatedAt: z.string(),
});
export type DocumentSummary = z.infer<typeof DocumentSummarySchema>;

// Row shown in the admin "Ingestion" history table
export const IngestionRunSchema = z.object({
  id: z.string(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  status: z.enum(["running", "succeeded", "failed"]),
  documentsProcessed: z.number().int(),
  chunksCreated: z.number().int(),
  chunksUpdated: z.number().int(),
  chunksDeleted: z.number().int(),
  triggeredBy: z.enum(["cli", "admin"]),
  error: z.string().nullable(),
});
export type IngestionRun = z.infer<typeof IngestionRunSchema>;

// Body accepted by POST /api/ingestion — admin-triggered run, no payload beyond this
export const TriggerIngestionRequestSchema = z.object({
  triggeredBy: z.literal("admin").default("admin"),
});
export type TriggerIngestionRequest = z.infer<typeof TriggerIngestionRequestSchema>;
