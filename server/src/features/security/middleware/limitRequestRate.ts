import { rateLimit } from "express-rate-limit";
import { securityConfig } from "../config/securityConfig";

// Caps how fast any one address can call the API, to blunt scraping and floods.
export const limitRequestRate = rateLimit({
  windowMs: 60 * 1000,
  limit: securityConfig.requestsPerMinute,
  skip: (req) => req.path === "/api/storage/changes",
});
