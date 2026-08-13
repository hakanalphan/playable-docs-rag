import type { RetrievedChunk } from "../retrieval/repository";

// Builds the system+context prompt — model must answer only from context and cite chunk_ids
export function buildPrompt(query: string, chunks: RetrievedChunk[]): { system: string; user: string } {
  const context = chunks.map((c) => `[chunk_id: ${c.chunkId}]\n${c.content}`).join("\n\n");
  const system = [
    "You are a grounded assistant for a playable-ads engineering team.",
    "Answer only using the provided context chunks.",
    "If the answer is not contained in the context, say the corpus does not cover this.",
    "For every factual claim, reference the supporting chunk_id inline, e.g. (chunk_id: abc123).",
    "Never invent a chunk_id that was not given to you.",
  ].join(" ");
  const user = `Context:\n${context}\n\nQuestion: ${query}`;
  return { system, user };
}
