import cookieParser from "cookie-parser";
import express from "express";
import { authRoutes } from "./features/auth/authRoutes";
import { shotgridRoutes } from "./features/shotgrid/shotgridRoutes";
import { storageRoutes } from "./features/storage/storageRoutes";
import { tasksRoutes } from "./features/tasks/tasksRoutes";
import { provenanceRoutes } from "./features/provenance/provenanceRoutes";
import { requireSignedIn } from "./features/auth/middleware/requireSignedIn";
import { applySecurity } from "./features/security/applySecurity";
import { requireRole } from "./features/auth/middleware/requireRole";
import { serveClientApp } from "./features/clientApp/serveClientApp";

export const app = express();
applySecurity(app);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/storage", requireSignedIn, storageRoutes);
app.use("/api/shotgrid", requireSignedIn, shotgridRoutes);
app.use("/api/tasks", requireSignedIn, tasksRoutes);
app.use(
  "/api/provenance",
  requireSignedIn,
  requireRole("creative_lead"),
  provenanceRoutes
);
serveClientApp(app);
