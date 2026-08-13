// Chunk shape returned by any retrieval source, before RRF fusion
export interface RetrievedChunk {
  chunkId: string; // primary key of the chunk row
  documentId: string; // parent document reference
  content: string; // raw chunk text used for generation
  score: number; // similarity/rank score, source-specific scale
  startOffset: number; // char offset in source doc, for citation display
  endOffset: number; // char offset end, for citation display
}

// Contract that core depends on — the db package provides the concrete implementation
export interface SearchRepository {
  vectorSearch(embedding: number[], k: number): Promise<RetrievedChunk[]>; // pgvector cosine scan
  keywordSearch(query: string, k: number): Promise<RetrievedChunk[]>; // Postgres full-text search
  getChunkById(chunkId: string): Promise<RetrievedChunk | null>; // used by citation resolution
  getDocumentSource(documentId: string): Promise<{ sourcePath: string; title: string } | null>;
}
