import { z } from "zod"; // core owns its own env slice, independent of db's env

const CoreEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  CHAT_MODEL: z.string().default("gpt-4o-mini"),
});

export const coreEnv = CoreEnvSchema.parse(process.env); // parsed once at import time
