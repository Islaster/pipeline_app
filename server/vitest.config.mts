import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Fake values so storageConfig loads and URL signing works offline.
    env: {
      AWS_REGION: "us-east-1",
      S3_BUCKET_NAME: "test-bucket",
      AWS_ACCESS_KEY_ID: "test-access-key",
      AWS_SECRET_ACCESS_KEY: "test-secret-key",
      SHOTGRID_SITE_URL: "https://test-studio.shotgrid.autodesk.com",
      SHOTGRID_SCRIPT_NAME: "test-script",
      SHOTGRID_SCRIPT_KEY: "test-key",
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
    },
  },
});
