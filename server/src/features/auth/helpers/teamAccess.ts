import type { User, UserRole } from "../../../../../shared/types/user";
import { AuthError } from "./AuthError";
import { canCreateRole } from "./rolePermissions";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidId(id: string): boolean {
  return uuidPattern.test(id);
}

// The one rule for the Team page: you can manage only the roles you're allowed to create.
export function canManageRole(actor: User, role: UserRole): boolean {
  return canCreateRole(actor.role, role);
}

export function assertCanManageRole(actor: User, role: UserRole): void {
  if (!canManageRole(actor, role)) {
    throw new AuthError(403, "You can't manage accounts with that role.");
  }
}
