import { S3Client } from "@aws-sdk/client-s3";
import { storageConfig } from "./storageConfig";

// Credentials are read automatically from AWS_ACCESS_KEY_ID /
// AWS_SECRET_ACCESS_KEY, or from the IAM role when deployed on AWS.
export const s3Client = new S3Client({ region: storageConfig.region });
