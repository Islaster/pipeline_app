import { Router, type Response } from "express";
import { getSignedInUser } from "../auth/helpers/signedInUser";
import { requireRole } from "../auth/middleware/requireRole";
import { shotgridConfig } from "../shotgrid/config/shotgridConfig";
import { rememberBriefly } from "../shotgrid/helpers/rememberBriefly";
import { tasksConfig } from "./config/tasksConfig";
import { listMyTasks } from "./services/listMyTasks";
import { listSequenceTasks } from "./services/listSequenceTasks";
import { isKnownStatus, setTaskStatus } from "./services/setTaskStatus";

export const tasksRoutes = Router();

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
    console.error("Tasks request failed:", error);
    res.status(502).json({
      error: error instanceof Error ? error.message : "Tasks request failed.",
    });
  }
}

// GET /api/tasks/columns  -> the board's columns, so the client and server agree
tasksRoutes.get("/columns", (_req, res) => {
  res.json({
    columns: tasksConfig.statusColumns,
    otherLabel: tasksConfig.otherColumnLabel,
  });
});

// GET /api/tasks/mine  -> the signed-in person's tasks
tasksRoutes.get("/mine", (_req, res) =>
  replyWith(res, () => listMyTasks(getSignedInUser(res).name))
);

// PATCH /api/tasks/:taskId/status  { status }  -> creative leads only
tasksRoutes.patch(
  "/:taskId/status",
  requireRole("creative_lead"),
  (req, res) => {
    const taskId = Number(req.params.taskId);
    const status: unknown = req.body?.status;
    if (!Number.isInteger(taskId)) {
      res.status(400).json({ error: "That task isn't valid." });
      return;
    }
    if (typeof status !== "string" || !isKnownStatus(status)) {
      res
        .status(400)
        .json({ error: "Choose a status from the board's columns." });
      return;
    }
    return replyWith(res, () => setTaskStatus(taskId, status));
  }
);

// GET /api/tasks/sequences/45  -> every task in that sequence (leads and creative leads)
tasksRoutes.get(
  "/sequences/:sequenceId",
  requireRole("creative_lead", "lead"),
  (req, res) => {
    const sequenceId = Number(req.params.sequenceId);
    if (!Number.isInteger(sequenceId)) {
      res.status(400).json({ error: "That sequence isn't valid." });
      return;
    }
    return replyWith(res, () =>
      rememberBriefly(`sequence-tasks:${sequenceId}`, () =>
        listSequenceTasks(sequenceId)
      )
    );
  }
);
