import {
  DeleteMessageBatchCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { storageConfig } from "../config/storageConfig";
import { refreshFileIndex } from "./fileIndex";
import { announceStorageChange } from "./storageChangeFeed";

interface S3EventMessage {
  Records?: { s3?: { object?: { key?: string } } }[];
}

const sqs = new SQSClient({ region: storageConfig.region });
const retryDelayMs = 10_000;

// S3 encodes keys in notifications the way URLs do.
function decodeKey(key: string): string {
  return decodeURIComponent(key.replace(/\+/g, " "));
}

async function receiveOnce(): Promise<void> {
  const received = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: storageConfig.eventsQueueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20, // long polling: the request waits for messages instead of asking repeatedly
    })
  );
  const messages = received.Messages ?? [];
  if (messages.length === 0) return;

  let sawNewFile = false;
  for (const message of messages) {
    const event = JSON.parse(message.Body ?? "{}") as S3EventMessage;
    for (const record of event.Records ?? []) {
      const key = record.s3?.object?.key;
      if (!key) continue;
      announceStorageChange(decodeKey(key));
      sawNewFile = true;
    }
  }

  await sqs.send(
    new DeleteMessageBatchCommand({
      QueueUrl: storageConfig.eventsQueueUrl,
      Entries: messages.map((message, index) => ({
        Id: String(index),
        ReceiptHandle: message.ReceiptHandle,
      })),
    })
  );

  // New files should be searchable right away, not after the next scheduled refresh.
  if (sawNewFile) refreshFileIndex().catch(() => undefined);
}

// Listens for new files for as long as the server runs. Does nothing when no queue is set.
export function startWatchingBucketEvents(): void {
  if (!storageConfig.eventsQueueUrl) return;

  const keepReceiving = async () => {
    for (;;) {
      try {
        await receiveOnce();
      } catch (error) {
        console.error("Storage events failed, retrying shortly:", error);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  };
  void keepReceiving();
  console.log("Watching the bucket for new files.");
}
