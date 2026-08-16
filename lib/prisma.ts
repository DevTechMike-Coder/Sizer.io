import { db } from "./db";

// Export unified database client (compatible with local JSON / SQLite & ready for Prisma PostgreSQL)
export const prisma = db;
