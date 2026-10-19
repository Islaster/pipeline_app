import type { Express } from "express";
import helmet from "helmet";
import { securityConfig } from "./config/securityConfig";
import { blockUnknownNetworks } from "./middleware/blockUnknownNetworks";
import { limitRequestRate } from "./middleware/limitRequestRate";

// App-wide protections. Call this before any routes are added.
export function applySecurity(app: Express): void {
  // Tells Express how many proxies to look past to find the visitor's real address.
  app.set("trust proxy", securityConfig.trustedProxyHops);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https://*.amazonaws.com",
            "https://*.shotgrid.autodesk.com",
            "https://*.shotgunstudio.com",
          ],
          mediaSrc: [
            "'self'",
            "blob:",
            "https://*.amazonaws.com",
            "https://*.shotgrid.autodesk.com",
            "https://*.shotgunstudio.com",
          ],
          connectSrc: ["'self'", "https://*.amazonaws.com"],
        },
      },
    })
  );
  app.use(blockUnknownNetworks);
  app.use(limitRequestRate);
}
