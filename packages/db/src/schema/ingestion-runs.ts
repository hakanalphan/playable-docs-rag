import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const ingestionRuns = pgTable("ingestion_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status", { enum: ["running", "succeeded", "failed"] }).notNull().default("running"),
  documentsProcessed: integer("documents_processed").notNull().default(0),
  chunksCreated: integer("chunks_created").notNull().default(0),
  chunksUpdated: integer("chunks_updated").notNull().default(0),
  chunksDeleted: integer("chunks_deleted").notNull().default(0),
  triggeredBy: text("triggered_by", { enum: ["cli", "admin"] }).notNull().default("cli"),
  error: text("error"),
});
