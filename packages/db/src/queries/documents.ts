import { eq, sql } from "drizzle-orm"; // small query surface, kept separate from ingestion/stats queries
import { db } from "../client";
import { documents } from "../schema";

// Powers the admin "Documents" table — status, chunk counts, last updated
export async function listDocuments() {
  return db.select().from(documents).orderBy(sql`${documents.updatedAt} desc`);
}

// Used by ingest.ts to decide skip/reindex based on the stored fingerprint
export async function findDocumentBySourcePath(sourcePath: string) {
  const [row] = await db.select().from(documents).where(eq(documents.sourcePath, sourcePath));
  return row ?? null;
}

// Soft-delete — status flips to "deleted", row is kept for audit history instead of a hard delete
export async function softDeleteDocument(id: string) {
  await db.update(documents).set({ status: "deleted", updatedAt: new Date() }).where(eq(documents.id, id));
}
