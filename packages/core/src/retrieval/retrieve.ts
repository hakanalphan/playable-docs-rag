import type { SearchRepository, RetrievedChunk } from "./repository";
import { reciprocalRankFusion } from "./rrf";

// Single entry point both apps/web and apps/mcp-server call — neither reimplements fan-out
export async function retrieve(
  repo: SearchRepository,
  query: string,
  embedding: number[],
  k: number,
): Promise<RetrievedChunk[]> {
  const [vectorResults, keywordResults] = await Promise.all([
    repo.vectorSearch(embedding, k),
    repo.keywordSearch(query, k),
  ]);
  return reciprocalRankFusion(vectorResults, keywordResults, k); // hybrid ranking, single fused list
}
