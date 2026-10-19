import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authConfig } from "./config/authConfig";
import { isUserRole } from "./helpers/rolePermissions";
import { clearSessionCookie, setSessionCookie } from "./helpers/sessionCookie";
import { getSignedInUser } from "./helpers/signedInUser";
import { handleAuthError } from "./middleware/handleAuthError";
import { requireSignedIn } from "./middleware/requireSignedIn";
import { acceptInvite } from "./services/acceptInvite";
import { createInvite } from "./services/createInvite";
import { findPendingInvite } from "./services/findPendingInvite";
import {
  cancelInvite,
  listPendingInvites,
  renewInvite,
} from "./services/manageInvites";
import {
  deleteMember,
  listTeamMembers,
  updateMember,
} from "./services/manageMembers";
import { endSession, startSession } from "./services/sessions";
import { signIn } from "./services/signIn";
import { MemberChanges } from "../../../../shared/types/user";

export const authRoutes = Router();

// Slows down password and invite-link guessing: 10 tries per 15 minutes per address.
const guessLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// ---- Signing in and out ----

// POST /api/auth/sign-in  { email, password }
authRoutes.post("/sign-in", guessLimiter, async (req, res) => {
  const user = await signIn(
    readText(req.body?.email),
    readText(req.body?.password)
  );
  const session = await startSession(user.id);
  setSessionCookie(res, session.token, session.expiresAt);
  res.json(user);
});

// POST /api/auth/sign-out
authRoutes.post("/sign-out", async (req, res) => {
  const token: unknown = req.cookies?.[authConfig.sessionCookieName];
  if (typeof token === "string") await endSession(token);
  clearSessionCookie(res);
  res.status(204).end();
});

// GET /api/auth/me  -> the signed-in user, or 401
authRoutes.get("/me", requireSignedIn, (_req, res) => {
  res.json(getSignedInUser(res));
});

// ---- Accepting an invite (not signed in yet) ----

// POST /api/auth/invites/lookup  { token }  -> who the invite is for
authRoutes.post("/invites/lookup", guessLimiter, async (req, res) => {
  const invite = await findPendingInvite(readText(req.body?.token));
  if (!invite) {
    res
      .status(404)
      .json({ error: "This invite link is invalid or has expired." });
    return;
  }
  res.json({ email: invite.email, name: invite.name, role: invite.role });
});

// POST /api/auth/invites/accept  { token, password }  -> creates the account and signs in
authRoutes.post("/invites/accept", guessLimiter, async (req, res) => {
  const user = await acceptInvite(
    readText(req.body?.token),
    readText(req.body?.password)
  );
  const session = await startSession(user.id);
  setSessionCookie(res, session.token, session.expiresAt);
  res.status(201).json(user);
});

// ---- Team management (creative leads and leads) ----

// POST /api/auth/invites  { email, name, role }  -> a new invite link
authRoutes.post("/invites", requireSignedIn, async (req, res) => {
  const email = readText(req.body?.email).trim();
  const name = readText(req.body?.name).trim();
  const role: unknown = req.body?.role;

  if (!email.includes("@") || !name || !isUserRole(role)) {
    res
      .status(400)
      .json({ error: "A name, a valid email, and a role are required." });
    return;
  }

  res
    .status(201)
    .json(await createInvite(getSignedInUser(res), { email, name, role }));
});

// GET /api/auth/invites  -> pending invites you can manage
authRoutes.get("/invites", requireSignedIn, async (_req, res) => {
  res.json(await listPendingInvites(getSignedInUser(res)));
});

// DELETE /api/auth/invites/:inviteId  -> cancel a pending invite
authRoutes.delete("/invites/:inviteId", requireSignedIn, async (req, res) => {
  await cancelInvite(getSignedInUser(res), readText(req.params.inviteId));
  res.status(204).end();
});

// POST /api/auth/invites/:inviteId/renew  -> a fresh link for a pending invite
authRoutes.post(
  "/invites/:inviteId/renew",
  requireSignedIn,
  async (req, res) => {
    res.json(
      await renewInvite(getSignedInUser(res), readText(req.params.inviteId))
    );
  }
);

// GET /api/auth/members  -> accounts you can manage
authRoutes.get("/members", requireSignedIn, async (_req, res) => {
  res.json(await listTeamMembers(getSignedInUser(res)));
});

// PATCH /api/auth/members/:memberId/details  { name?, email?, role? }
authRoutes.patch(
  "/members/:memberId/details",
  requireSignedIn,
  async (req, res) => {
    const changes: MemberChanges = {};
    if (typeof req.body?.name === "string") changes.name = req.body.name;
    if (typeof req.body?.email === "string") changes.email = req.body.email;
    if (isUserRole(req.body?.role)) changes.role = req.body.role;
    res.json(
      await updateMember(
        getSignedInUser(res),
        readText(req.params.memberId),
        changes
      )
    );
  }
);

// DELETE /api/auth/members/:memberId
authRoutes.delete("/members/:memberId", requireSignedIn, async (req, res) => {
  await deleteMember(getSignedInUser(res), readText(req.params.memberId));
  res.status(204).end();
});

authRoutes.use(handleAuthError);
