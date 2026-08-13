import type { RetrievedChunk } from "./repository";

const RRF_K = 60; // standard damping constant from the original RRF paper, flat weighting across ranks

// Combines two independently-ranked chunk lists into one fused ranking by reciprocal rank fusion
export function reciprocalRankFusion(
  vectorResults: RetrievedChunk[],
  keywordResults: RetrievedChunk[],
  limit: number,
): RetrievedChunk[] {
  const fused = new Map<string, { chunk: RetrievedChunk; rrfScore: number }>();

  vectorResults.forEach((chunk, rank) => { // rank is 0-indexed, so +1 below matches the paper's 1-indexed rank
    const existing = fused.get(chunk.chunkId);
    const contribution = 1 / (RRF_K + rank + 1);
    fused.set(chunk.chunkId, { chunk, rrfScore: (existing?.rrfScore ?? 0) + contribution });
  });

  keywordResults.forEach((chunk, rank) => { // same chunk appearing in both lists gets both contributions summed
    const existing = fused.get(chunk.chunkId);
    const contribution = 1 / (RRF_K + rank + 1);
    fused.set(chunk.chunkId, { chunk, rrfScore: (existing?.rrfScore ?? 0) + contribution });
  });

  return [...fused.values()]
    .sort((a, b) => b.rrfScore - a.rrfScore) // highest fused score first
    .slice(0, limit)
    .map((entry) => ({ ...entry.chunk, score: entry.rrfScore })); // overwrite source-specific score with fused score
}
