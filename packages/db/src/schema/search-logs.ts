import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const searchLogs = pgTable("search_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  query: text("query").notNull(),
  userId: uuid("user_id"),
  surface: text("surface", { enum: ["chat", "mcp", "api"] }).notNull(), // which entry point issued the query
  resultCount: integer("result_count").notNull(),
  relevantCount: integer("relevant_count"), // filled by the eval script, null for real traffic
  citedCount: integer("cited_count").notNull().default(0),
  grounded: boolean("grounded").notNull().default(false), // whether the answer had any resolved citation
  retrievalMs: integer("retrieval_ms").notNull(),
  generationMs: integer("generation_ms").notNull(),
  totalMs: integer("total_ms").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
