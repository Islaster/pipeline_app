import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("Missing environment variable: DATABASE_URL");

export const database = new Pool({
  connectionString,
  // Hosted databases require SSL; local Postgres usually doesn't offer it.
  ssl:
    process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});
