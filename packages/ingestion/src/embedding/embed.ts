import OpenAI from "openai"; // separate client instance from core's — ingestion runs standalone

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";

// Batches all chunk texts for a document into one API call — cheaper and faster than one call per chunk
export async function embedChunks(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const response = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts });
  return response.data.map((d) => d.embedding);
}
