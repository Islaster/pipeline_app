import express, { type Express } from "express";
import { existsSync } from "node:fs";
import path from "node:path";

// Where the client's build lands, relative to the server folder.
const clientBuildFolder = path.resolve("../client/dist");

// Serves the built client. Any address that isn't an API route gets index.html,
// so the invite link (/accept-invite) and a page reload both work.
export function serveClientApp(app: Express): void {
  if (!existsSync(clientBuildFolder)) {
    console.log("No client build found; serving API only.");
    return;
  }

  app.use(
    express.static(clientBuildFolder, {
      index: false,
      maxAge: "1y",
      immutable: true,
    })
  );
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientBuildFolder, "index.html"));
  });
}
