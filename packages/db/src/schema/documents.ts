import { pgTable, text, timestamp, integer, jsonb, uuid } from "drizzle-orm/pg-core";

// One row per source file in data/corpus — soft-deleted, never hard-deleted, with fingerprint-based skip
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourcePath: text("source_path").notNull().unique(), // e.g. "sdk-notes-v3.md"
  title: text("title").notNull(),
  fingerprint: text("fingerprint").notNull(), // content+frontmatter+embeddingModel+chunkConfig+pipelineVersion hash
  status: text("status", { enum: ["indexed", "pending", "failed", "deleted"] }).notNull().default("pending"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  chunkCount: integer("chunk_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
