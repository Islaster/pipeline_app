import type { NextFunction, Request, Response } from "express";
import { securityConfig } from "../config/securityConfig";
import { createAddressChecker } from "../helpers/createAddressChecker";

const isAllowedAddress = createAddressChecker(securityConfig.allowedNetworks);
const isRestricted = securityConfig.allowedNetworks.length > 0;

// Turns away any request that doesn't come from an approved network.
export function blockUnknownNetworks(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!isRestricted || isAllowedAddress(req.ip ?? "")) {
    next();
    return;
  }
  res
    .status(403)
    .json({ error: "This app is only available from approved networks." });
}
