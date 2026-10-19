import type { ShotgridConnectionStatus } from "../../../../../shared/types/shotgrid";
import { shotgridConfig } from "../config/shotgridConfig";
import { getShotgridAccessToken } from "./getShotgridAccessToken";

// A successful sign-in proves the site address, script name, and key are all correct.
export async function checkShotgridConnection(): Promise<ShotgridConnectionStatus> {
  if (!shotgridConfig.isConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      message: "ShotGrid credentials are not set.",
    };
  }

  try {
    await getShotgridAccessToken();
    return {
      isConfigured: true,
      isConnected: true,
      message: "Connected to ShotGrid.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not reach ShotGrid.";
    return { isConfigured: true, isConnected: false, message };
  }
}
