import { z } from "zod"; // fail fast on missing/malformed env instead of a cryptic driver error

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export const dbEnv = EnvSchema.parse(process.env); // throws with a clear message at import time
