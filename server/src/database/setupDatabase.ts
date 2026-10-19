import { readFile } from "node:fs/promises";
import path from "node:path";
import { database } from "./database";

// Creates any missing tables. Safe to run on every start: the schema only adds what isn't there.
export async function ensureDatabaseTables(): Promise<void> {
  const schema = await readFile(path.join(__dirname, "schema.sql"), "utf8");
  await database.query(schema);
  console.log("Database tables are ready.");
}

// Run directly (npm run db:setup) it sets up the tables and exits.
if (require.main === module) {
  ensureDatabaseTables()
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => void database.end());
}
