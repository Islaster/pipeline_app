import { Router, type Response } from "express";
import { shotgridConfig } from "./config/shotgridConfig";
import { checkShotgridConnection } from "./services/checkShotgridConnection";
import { listShotgridProjects } from "./services/listShotgridProjects";
import { listShotgridShots } from "./services/listShotgridShots";
import { getSignedInUser } from "../auth/helpers/signedInUser";
import { requireRole } from "../auth/middleware/requireRole";
import { listMyShotgridAssignments } from "./services/listMyShotgridAssignments";
import { listShotgridShotArtists } from "./services/listShotgridShotArtists";
import { getShotgridShotDetails } from "./services/getShotgridShotDetails";
import { listShotgridSequences } from "./services/listShotgridSequences";
import { listShotgridSequenceShots } from "./services/listShotgridSequenceShots";
import { rememberBriefly } from "./helpers/rememberBriefly";

export const shotgridRoutes = Router();
// Who can use the shots-by-artist board. Add a role here to open it to more people.
const canUseArtistBoard = requireRole("creative_lead", "lead");

// Sends ShotGrid problems back as a readable message instead of a bare server error.
async function replyWith<T>(
  res: Response,
  load: () => Promise<T>
): Promise<void> {
  if (!shotgridConfig.isConfigured) {
    res.status(503).json({ error: "ShotGrid credentials are not set." });
    return;
  }
  try {
    res.json(await load());
  } catch (error) {
    console.error("ShotGrid request failed:", error);
    res.status(502).json({
      error:
        error instanceof Error ? error.message : "ShotGrid request failed.",
    });
  }
}

// GET /api/shotgrid/status
shotgridRoutes.get("/status", async (_req, res) => {
  res.json(await checkShotgridConnection());
});

// GET /api/shotgrid/my-assignments
shotgridRoutes.get("/my-assignments", (_req, res) =>
  replyWith(res, () => listMyShotgridAssignments(getSignedInUser(res).name))
);

// management and leads; the server enforces it, not just the screen:
shotgridRoutes.use("/projects", requireRole("creative_lead", "lead"));

// GET /api/shotgrid/projects
shotgridRoutes.get("/projects", (_req, res) =>
  replyWith(res, listShotgridProjects)
);

// GET /api/shotgrid/projects/82/shots
shotgridRoutes.get("/projects/:projectId/shots", (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!Number.isInteger(projectId)) {
    res.status(400).json({ error: "That project isn't valid." });
    return;
  }
  return replyWith(res, () => listShotgridShots(projectId));
});

// GET /api/shotgrid/projects/82/shot-artists  (creative leads only)
shotgridRoutes.get(
  "/projects/:projectId/shot-artists",
  requireRole("creative_lead"),
  (req, res) => {
    const projectId = Number(req.params.projectId);
    if (!Number.isInteger(projectId)) {
      res.status(400).json({ error: "That project isn't valid." });
      return;
    }
    return replyWith(res, () => listShotgridShotArtists(projectId));
  }
);

// GET /api/shotgrid/shots/1234
shotgridRoutes.get("/shots/:shotId", (req, res) => {
  const shotId = Number(req.params.shotId);
  if (!Number.isInteger(shotId)) {
    res.status(400).json({ error: "That shot isn't valid." });
    return;
  }
  return replyWith(res, async () => {
    const details = await getShotgridShotDetails(shotId);
    if (!details) throw new Error("That shot wasn't found in ShotGrid.");
    return details;
  });
});

// GET /api/shotgrid/projects/82/sequences
shotgridRoutes.get(
  "/projects/:projectId/sequences",
  canUseArtistBoard,
  (req, res) => {
    const projectId = Number(req.params.projectId);
    if (!Number.isInteger(projectId)) {
      res.status(400).json({ error: "That project isn't valid." });
      return;
    }
    return replyWith(res, () =>
      rememberBriefly(`sequences:${projectId}`, () =>
        listShotgridSequences(projectId)
      )
    );
  }
);

// GET /api/shotgrid/sequences/45/shots
shotgridRoutes.get(
  "/sequences/:sequenceId/shots",
  canUseArtistBoard,
  (req, res) => {
    const sequenceId = Number(req.params.sequenceId);
    if (!Number.isInteger(sequenceId)) {
      res.status(400).json({ error: "That sequence isn't valid." });
      return;
    }
    return replyWith(res, () =>
      rememberBriefly(`sequence-shots:${sequenceId}`, () =>
        listShotgridSequenceShots(sequenceId)
      )
    );
  }
);
