import OpenAI from "openai"; // chat completion client, separate instance from embed-query's
import { coreEnv } from "../config";
import { buildPrompt } from "./prompt";
import type { RetrievedChunk } from "../retrieval/repository";

const openai = new OpenAI({ apiKey: coreEnv.OPENAI_API_KEY });
const CHUNK_ID_PATTERN = /chunk_id:\s*([a-f0-9-]+)/gi; // matches the inline citation format from the prompt

// Runs the LLM call and extracts cited chunk ids by regex — the model's prose is never trusted directly
export async function generate(
  query: string,
  chunks: RetrievedChunk[],
): Promise<{ answer: string | null; citedChunkIds: string[] }> {
  if (chunks.length === 0) return { answer: null, citedChunkIds: [] }; // no retrieval hits, nothing to ground on

  const { system, user } = buildPrompt(query, chunks);
  const completion = await openai.chat.completions.create({
    model: coreEnv.CHAT_MODEL,
    temperature: 0.1, // low temperature, this is a grounded factual task not creative writing
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const notCovered = /does not cover|not contained in the context|cannot find/i.test(text);
  const citedChunkIds = [...text.matchAll(CHUNK_ID_PATTERN)].map((m) => m[1]);
  return { answer: notCovered && citedChunkIds.length === 0 ? null : text, citedChunkIds };
}
