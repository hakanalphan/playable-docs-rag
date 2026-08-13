import { customType } from "drizzle-orm/pg-core"; // Drizzle has no built-in pgvector support

// Maps to Postgres `vector(1536)` — dimension matches text-embedding-3-small
export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`; // pgvector's text input format
  },
  fromDriver(value: string): number[] {
    return value.slice(1, -1).split(",").map(Number); // strip [ ] and parse back to numbers
  },
});
