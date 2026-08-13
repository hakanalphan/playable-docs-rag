import { config } from "dotenv"; // dotenv itself doesn't search upward, this walks up manually
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";

// CLI scripts (ingest, seed, eval) can be invoked from any cwd — this walks up to find the repo root .env
export function loadRootEnv(startDir: string = process.cwd()): void {
  let dir = startDir;
  for (let i = 0; i < 6; i++) { // repo is shallow, 6 levels up is more than enough
    const candidate = join(dir, ".env");
    if (existsSync(candidate)) { config({ path: candidate }); return; }
    const parent = dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }
  console.warn("No .env file found walking up from", startDir); // non-fatal, env vars may be set externally
}
