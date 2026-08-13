import { sql, desc, eq } from "drizzle-orm"; // raw sql`` needed for the pgvector distance operator and ts_rank
import { db } from "../client";
import { chunks, documents } from "../schema";
import type { SearchRepository, RetrievedChunk } from "@playable-rag/core"; // contract defined in packages/core

// Concrete implementation — the only place in the codebase that knows pgvector/SQL
export class PgSearchRepository implements SearchRepository {
  async vectorSearch(embedding: number[], k: number): Promise<RetrievedChunk[]> {
    const vec = `[${embedding.join(",")}]`; // pgvector text literal format for the query embedding
    const rows = await db // exact cosine scan — appropriate for a small corpus, no ivfflat
      .select({
        id: chunks.id,
        docId: chunks.documentId,
        content: chunks.content,
        startOffset: chunks.startOffset,
        endOffset: chunks.endOffset,
        distance: sql<number>`${chunks.embedding} <=> ${vec}::vector`,
      })
      .from(chunks)
      .orderBy(sql`${chunks.embedding} <=> ${vec}::vector`)
      .limit(k);
    return rows.map((r) => ({
      chunkId: r.id,
      documentId: r.docId,
      content: r.content,
      score: 1 - r.distance, // cosine distance -> similarity
      startOffset: r.startOffset,
      endOffset: r.endOffset,
    }));
  }

  async keywordSearch(query: string, k: number): Promise<RetrievedChunk[]> {
    const rows = await db // native Postgres full-text search, no external search engine
      .select({
        id: chunks.id,
        docId: chunks.documentId,
        content: chunks.content,
        startOffset: chunks.startOffset,
        endOffset: chunks.endOffset,
        rank: sql<number>`ts_rank(${chunks.contentTsv}, plainto_tsquery('english', ${query}))`,
      })
      .from(chunks)
      .where(sql`${chunks.contentTsv} @@ plainto_tsquery('english', ${query})`)
      .orderBy(desc(sql`ts_rank(${chunks.contentTsv}, plainto_tsquery('english', ${query}))`))
      .limit(k);
    return rows.map((r) => ({
      chunkId: r.id,
      documentId: r.docId,
      content: r.content,
      score: r.rank,
      startOffset: r.startOffset,
      endOffset: r.endOffset,
    }));
  }

  async getChunkById(chunkId: string): Promise<RetrievedChunk | null> {
    const [row] = await db.select().from(chunks).where(eq(chunks.id, chunkId));
    if (!row) return null;
    return {
      chunkId: row.id,
      documentId: row.documentId,
      content: row.content,
      score: 0, // not a ranked result, fetched directly by id for citation resolution
      startOffset: row.startOffset,
      endOffset: row.endOffset,
    };
  }

  async getDocumentSource(documentId: string) {
    const [row] = await db
      .select({ sourcePath: documents.sourcePath, title: documents.title })
      .from(documents)
      .where(eq(documents.id, documentId));
    return row ?? null; // null propagates up to resolveCitations, which silently drops the citation
  }
}
