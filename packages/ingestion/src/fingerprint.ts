import { createHash } from "node:crypto"; // built-in, no extra dependency needed

export interface FingerprintInput {
  content: string;
  frontmatter: Record<string, unknown>;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  pipelineVersion: string;
}

// Changing any input here (model, chunk config, or the doc itself) produces a different fingerprint
export function computeFingerprint(input: FingerprintInput): string {
  const payload = JSON.stringify({ ...input, frontmatter: sortKeys(input.frontmatter) });
  return createHash("sha256").update(payload).digest("hex");
}

function sortKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}
