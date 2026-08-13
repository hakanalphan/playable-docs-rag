import { sql, eq, and, ne, notInArray } from "drizzle-orm"; // notInArray powers the "removed from corpus" soft-delete
import { db, documents, chunks } from "@playable-rag/db";
import { startIngestionRun, finishIngestionRun } from "@playable-rag/db";
import { loadCorpus } from "./loaders/markdown-loader";
import { chunkDocument } from "./chunking/chunk";
import { embedChunks } from "./embedding/embed";
import { computeFingerprint } from "./fingerprint";

const LOCK_KEY = 727271; // arbitrary constant, must match across all callers of pg_advisory_lock

export interface IngestOptions {
  corpusDir: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  pipelineVersion: string;
  triggeredBy: "cli" | "admin";
}

// Repeatable, observable ingestion: skip unchanged docs via fingerprint, soft-delete removed ones, advisory-lock guarded
export async function runIngestion(opts: IngestOptions) {
  const [{ locked }] = await db.execute<{ locked: boolean }>(sql`select pg_try_advisory_lock(${LOCK_KEY}) as locked`);
  if (!locked) throw new Error("Another ingestion run is already in progress");

  const run = await startIngestionRun(opts.triggeredBy);
  let created = 0;
  let updated = 0;
  let deleted = 0;
  let processed = 0;

  try {
    const loaded = await loadCorpus(opts.corpusDir);
    const seenPaths: string[] = [];

    for (const doc of loaded) {
      seenPaths.push(doc.sourcePath);
      processed++;

      const fingerprint = computeFingerprint({
        content: doc.content,
        frontmatter: doc.frontmatter,
        embeddingModel: opts.embeddingModel,
        chunkSize: opts.chunkSize,
        chunkOverlap: opts.chunkOverlap,
        pipelineVersion: opts.pipelineVersion,
      });

      const [existing] = await db.select().from(documents).where(eq(documents.sourcePath, doc.sourcePath));
      if (existing && existing.fingerprint === fingerprint && existing.status === "indexed") continue; // unchanged, skip

      const pieces = await chunkDocument(doc.content, opts.chunkSize, opts.chunkOverlap);
      const embeddings = await embedChunks(pieces.map((p) => p.content));

      const [docRow] = existing
        ? await db
            .update(documents)
            .set({
              title: doc.title,
              fingerprint,
              status: "indexed",
              chunkCount: pieces.length,
              metadata: doc.frontmatter,
              updatedAt: new Date(),
            })
            .where(eq(documents.id, existing.id))
            .returning()
        : await db
            .insert(documents)
            .values({
              sourcePath: doc.sourcePath,
              title: doc.title,
              fingerprint,
              status: "indexed",
              chunkCount: pieces.length,
              metadata: doc.frontmatter,
            })
            .returning();

      if (existing) await db.delete(chunks).where(eq(chunks.documentId, docRow.id)); // full rechunk on any change

      await db.insert(chunks).values(
        pieces.map((piece, i) => ({
          documentId: docRow.id,
          chunkIndex: i,
          content: piece.content,
          embedding: embeddings[i],
          startOffset: piece.startOffset,
          endOffset: piece.endOffset,
          tokenCount: Math.ceil(piece.content.length / 4), // rough estimate, not an exact tokenizer count
        })),
      );

      existing ? updated++ : created++;
    }

    // Soft-delete documents that used to exist but are no longer present in the corpus directory
    if (seenPaths.length > 0) {
      const removed = await db
        .update(documents)
        .set({ status: "deleted", updatedAt: new Date() })
        .where(and(notInArray(documents.sourcePath, seenPaths), ne(documents.status, "deleted")))
        .returning();
      deleted = removed.length;
    }

    await finishIngestionRun(run.id, {
      status: "succeeded",
      documentsProcessed: processed,
      chunksCreated: created,
      chunksUpdated: updated,
      chunksDeleted: deleted,
    });
    return { runId: run.id, documentsProcessed: processed, chunksCreated: created, chunksUpdated: updated, chunksDeleted: deleted };
  } catch (err) {
    await finishIngestionRun(run.id, {
      status: "failed",
      documentsProcessed: processed,
      chunksCreated: created,
      chunksUpdated: updated,
      chunksDeleted: deleted,
      error: String(err),
    });
    throw err;
  } finally {
    await db.execute(sql`select pg_advisory_unlock(${LOCK_KEY})`); // always release, even on failure
  }
}
