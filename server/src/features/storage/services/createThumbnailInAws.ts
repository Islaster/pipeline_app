import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { storageConfig } from "../config/storageConfig";

const lambda = new LambdaClient({ region: storageConfig.region });

// Asks the AWS function to shrink the image next to the bucket and send back the small result.
export async function createThumbnailInAws(
  key: string
): Promise<Buffer | null> {
  const response = await lambda.send(
    new InvokeCommand({
      FunctionName: storageConfig.thumbnailFunctionName,
      Payload: Buffer.from(
        JSON.stringify({
          key,
          sizePx: storageConfig.thumbnailSizePx,
          maxSourceBytes: storageConfig.thumbnailMaxSourceBytes,
        })
      ),
    })
  );

  if (response.FunctionError || !response.Payload) {
    throw new Error(`The thumbnail function failed for ${key}`);
  }

  const result = JSON.parse(Buffer.from(response.Payload).toString("utf8")) as {
    thumbnailBase64: string | null;
  };
  return result.thumbnailBase64
    ? Buffer.from(result.thumbnailBase64, "base64")
    : null;
}
