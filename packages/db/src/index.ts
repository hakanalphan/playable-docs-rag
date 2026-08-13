export { db } from "./client"; // shared Drizzle instance
export * from "./schema";
export * from "./repository/search-repository"; // PgSearchRepository — implements core's SearchRepository
export * from "./queries/documents";
export * from "./queries/ingestion";
export * from "./queries/stats";
