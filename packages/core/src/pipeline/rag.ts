import type { SearchRepository } from "../retrieval/repository";
import type { SearchResponse } from "@playable-rag/shared-types";
import { retrieve } from "../retrieval/retrieve";
import { embedQuery } from "../retrieval/embed-query";
import { generate } from "../generation/generate";
import { resolveCitations } from "../citation/resolve";

// The one function apps/web's /api/chat and apps/mcp-server's search tool both call
export async function runRagPipeline(repo: SearchRepository, query: string, k = 5): Promise<SearchResponse> {
  const embedding = await embedQuery(query); // same embedding model as ingestion, mismatch breaks vector search
  const chunks = await retrieve(repo, query, embedding, k); // hybrid vector+keyword, RRF fused
  const { answer, citedChunkIds } = await generate(query, chunks); // LLM answer + raw cited chunk_ids
  const citations = await resolveCitations(repo, citedChunkIds); // deterministic, DB-verified
  return { answer, grounded: citations.length > 0, citations };
}
