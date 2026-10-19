import { app } from "./app";
import { ensureDatabaseTables } from "./database/setupDatabase";
import { startFileIndexRefresh } from "./features/storage/services/fileIndex";
import { startWatchingBucketEvents } from "./features/storage/services/watchBucketEvents";

const port = Number(process.env.PORT ?? 3001);

async function start(): Promise<void> {
  await ensureDatabaseTables();

  app.listen(port, () => {
    console.log(`Pipeline API running at http://localhost:${port}`);
    startFileIndexRefresh();
    startWatchingBucketEvents();
  });
}

start().catch((error: unknown) => {
  console.error("The server could not start:", error);
  process.exit(1);
});
