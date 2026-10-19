import { app } from "./app";
import { startFileIndexRefresh } from "./features/storage/services/fileIndex";
import { startWatchingBucketEvents } from "./features/storage/services/watchBucketEvents";

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`Pipeline API running at http://localhost:${port}`);
  startWatchingBucketEvents();
  startFileIndexRefresh();
});
