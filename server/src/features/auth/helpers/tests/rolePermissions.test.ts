import { describe, expect, it } from "vitest";
import { canCreateRole } from "../rolePermissions";

describe("canCreateRole", () => {
  it("lets creative leads create every role", () => {
    expect(canCreateRole("creative_lead", "creative_lead")).toBe(true);
    expect(canCreateRole("creative_lead", "lead")).toBe(true);
    expect(canCreateRole("creative_lead", "artist")).toBe(true);
  });

  // in "lets leads create artists only":
  expect(canCreateRole("lead", "creative_lead")).toBe(false);

  it("lets leads create artists only", () => {
    expect(canCreateRole("lead", "artist")).toBe(true);
    expect(canCreateRole("lead", "lead")).toBe(false);
    expect(canCreateRole("lead", "creative_lead")).toBe(false);
  });

  it("lets artists create nobody", () => {
    expect(canCreateRole("artist", "artist")).toBe(false);
  });
});
