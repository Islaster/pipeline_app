import { Router } from "express";
import { findLineageShots } from "./services/findLineageShots";
import { getShotLineage } from "./services/getShotLineage";
import {
  listProvenanceProjects,
  resolveProvenanceProjectId,
} from "./services/findTrackedProject";
import { shotgridConfig } from "../shotgrid/config/shotgridConfig";
import { listProjectShots } from "./services/listProjectShots";
import { provenanceConfig } from "./config/provenanceConfig";

export const provenanceRoutes = Router();

const shotCodePattern = /^\d{3}_[A-Z]+_\d{4}$/;

// GET /api/provenance/shots?q=08&sequence=006_HKA&project=82
//   -> sequences and matching shots, from ShotGrid for a project or from storage otherwise
provenanceRoutes.get("/shots", async (req, res) => {
  const query =
    typeof req.query.q === "string" ? req.query.q.trim().toUpperCase() : "";
  const sequence =
    typeof req.query.sequence === "string" && req.query.sequence
      ? req.query.sequence
      : null;
  const projectId = Number(req.query.project);

  if (!shotgridConfig.isConfigured || !Number.isInteger(projectId)) {
    res.json(findLineageShots(query, sequence)); // storage only
    return;
  }

  try {
    const { sequences, shots } = await listProjectShots(projectId);
    const matches = shots
      .filter(
        (shot) =>
          (!sequence || shot.sequence === sequence) &&
          shot.code.toUpperCase().includes(query)
      )
      .map((shot) => shot.code);
    res.json({
      sequences,
      shots: matches.slice(0, provenanceConfig.shotSearchLimit),
      totalMatches: matches.length,
    });
  } catch (error) {
    console.error("Provenance project shots failed:", error);
    res.status(502).json({ error: "ShotGrid couldn't be reached." });
  }
});

// GET /api/provenance/projects  -> ShotGrid projects, with the default marked
provenanceRoutes.get("/projects", async (_req, res) => {
  if (!shotgridConfig.isConfigured) {
    res.json([]); // no ShotGrid: the sidebar shows no project section
    return;
  }
  try {
    res.json(await listProvenanceProjects());
  } catch (error) {
    console.error("Provenance projects failed:", error);
    res.status(502).json({ error: "ShotGrid couldn't be reached." });
  }
});

// GET /api/provenance/shots/006_HKA_0820?project=82  -> that shot's tree
provenanceRoutes.get("/shots/:shotCode", async (req, res) => {
  const shotCode = req.params.shotCode.toUpperCase();
  if (!shotCodePattern.test(shotCode)) {
    res.status(400).json({ error: "That shot code isn't valid." });
    return;
  }
  const requested = Number(req.query.project);
  const projectId = shotgridConfig.isConfigured
    ? await resolveProvenanceProjectId(
        Number.isInteger(requested) ? requested : null
      )
    : null;
  res.json(await getShotLineage(shotCode, projectId));
});
