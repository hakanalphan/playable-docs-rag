import { defineConfig } from "drizzle-kit"; // drizzle-kit push reads this to generate/apply schema

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  // NOTE: after first `db:push`, run the one-time SQL below manually (drizzle-kit
  // cannot express GENERATED ALWAYS AS ... STORED columns):
  //   CREATE EXTENSION IF NOT EXISTS vector;
  //   ALTER TABLE chunks ADD COLUMN IF NOT EXISTS content_tsv tsvector
  //     GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
  //   CREATE INDEX IF NOT EXISTS chunks_content_tsv_idx ON chunks USING GIN (content_tsv);
});
