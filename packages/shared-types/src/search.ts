import { z } from "zod"; // single validation library for every API/route boundary

// Request body accepted by /api/search and the MCP search tool — same shape, top and bottom
export const SearchRequestSchema = z.object({
  query: z.string().min(1).max(2000),
  k: z.number().int().min(1).max(20).default(5),
});
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// A single citation, always resolved server-side from a chunk id — never trust model text
export const CitationSchema = z.object({
  chunkId: z.string(),
  documentId: z.string(),
  sourcePath: z.string(),
  title: z.string(),
  startOffset: z.number(),
  endOffset: z.number(),
  score: z.number(),
});
export type Citation = z.infer<typeof CitationSchema>;

// Response returned by both the chat pipeline and the MCP search tool
export const SearchResponseSchema = z.object({
  answer: z.string().nullable(), // null when the corpus genuinely has no answer
  grounded: z.boolean(), // false triggers the "not covered by corpus" UI state
  citations: z.array(CitationSchema),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
