import { describe, expect, it } from "vitest";
import { createAddressChecker } from "../createAddressChecker";

describe("createAddressChecker", () => {
  const isAllowed = createAddressChecker(["198.51.100.7", "203.0.113.0/24"]);

  it("allows a listed address", () => {
    expect(isAllowed("198.51.100.7")).toBe(true);
  });

  it("allows any address inside a listed range", () => {
    expect(isAllowed("203.0.113.42")).toBe(true);
  });

  it("allows an IPv4 address written in IPv6 form", () => {
    expect(isAllowed("::ffff:198.51.100.7")).toBe(true);
  });

  it("rejects everything else", () => {
    expect(isAllowed("192.0.2.1")).toBe(false);
    expect(isAllowed("not-an-address")).toBe(false);
  });

  it("refuses to start with an invalid entry", () => {
    expect(() => createAddressChecker(["not-an-address"])).toThrow();
  });
});
