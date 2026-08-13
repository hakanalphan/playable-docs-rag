import { pgTable, text, integer, uuid, customType } from "drizzle-orm/pg-core";
import { vector } from "./vector";
import { documents } from "./documents";

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });

// One row per chunk — embedding used for vector search, contentTsv used for keyword search
export const chunks = pgTable("chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(), // order within the parent document
  content: text("content").notNull(),
  contentTsv: tsvector("content_tsv"), // populated via GENERATED ALWAYS AS, see drizzle.config.ts note
  embedding: vector("embedding").notNull(),
  startOffset: integer("start_offset").notNull(),
  endOffset: integer("end_offset").notNull(),
  tokenCount: integer("token_count").notNull(),
});
