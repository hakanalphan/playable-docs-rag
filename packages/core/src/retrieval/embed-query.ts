import OpenAI from "openai"; // official SDK, single client instantiated once per process
import { coreEnv } from "../config";

const openai = new OpenAI({ apiKey: coreEnv.OPENAI_API_KEY });

// Embeds the raw user query with the same model used at ingestion time — mismatch would break vector search
export async function embedQuery(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({ model: coreEnv.EMBEDDING_MODEL, input: query });
  return response.data[0].embedding; // 1536-dim vector for text-embedding-3-small
}
