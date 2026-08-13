import { readdir, readFile } from "node:fs/promises"; // plain fs is enough for a local corpus directory
import { join } from "node:path";
import matter from "gray-matter"; // parses YAML frontmatter out of each markdown file

export interface LoadedDocument {
  sourcePath: string; // relative filename, stable identity across ingestion runs
  title: string; // frontmatter title, falls back to filename
  content: string; // markdown body, frontmatter stripped
  frontmatter: Record<string, unknown>; // folded into the fingerprint so metadata changes trigger reindex
}

// Reads every .md file in the corpus directory — LangChain's DirectoryLoader would work too, this is simpler
export async function loadCorpus(corpusDir: string): Promise<LoadedDocument[]> {
  const files = (await readdir(corpusDir)).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.map(async (file) => {
      const raw = await readFile(join(corpusDir, file), "utf-8");
      const { content, data } = matter(raw); // data = frontmatter, content = body
      return {
        sourcePath: file,
        title: (data.title as string) ?? file.replace(/\.md$/, ""),
        content,
        frontmatter: data,
      };
    }),
  );
}
