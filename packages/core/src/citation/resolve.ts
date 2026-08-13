import type { SearchRepository } from "../retrieval/repository";
import type { Citation } from "@playable-rag/shared-types";

// Turns model-cited chunk ids into verified citations by re-reading the DB — the trust boundary
export async function resolveCitations(repo: SearchRepository, chunkIds: string[]): Promise<Citation[]> {
  const unique = [...new Set(chunkIds)]; // model may reference the same chunk more than once
  const resolved = await Promise.all(
    unique.map(async (chunkId) => {
      const chunk = await repo.getChunkById(chunkId);
      if (!chunk) return null; // model hallucinated an id that doesn't exist — dropped, never shown
      const source = await repo.getDocumentSource(chunk.documentId);
      if (!source) return null;
      return {
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        sourcePath: source.sourcePath,
        title: source.title,
        startOffset: chunk.startOffset,
        endOffset: chunk.endOffset,
        score: chunk.score,
      };
    }),
  );
  return resolved.filter((c): c is Citation => c !== null); // drop any unresolved ids
}
