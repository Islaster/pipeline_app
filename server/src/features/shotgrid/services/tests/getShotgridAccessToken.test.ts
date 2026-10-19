import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearShotgridAccessToken,
  getShotgridAccessToken,
} from "../getShotgridAccessToken";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function signInSucceeds() {
  fetchMock.mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify({ access_token: "token-1", expires_in: 600 }))
    )
  );
}

describe("getShotgridAccessToken", () => {
  beforeEach(() => {
    clearShotgridAccessToken();
    fetchMock.mockReset();
  });

  it("signs in with the script name and key", async () => {
    signInSucceeds();

    const token = await getShotgridAccessToken();

    const [url, request] = fetchMock.mock.calls[0] ?? [];
    expect(token).toBe("token-1");
    expect(url).toBe(
      "https://test-studio.shotgrid.autodesk.com/api/v1.1/auth/access_token"
    );
    expect(String(request.body)).toContain("client_id=test-script");
  });

  it("reuses the token instead of signing in again", async () => {
    signInSucceeds();

    await getShotgridAccessToken();
    await getShotgridAccessToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports a failed sign-in", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 401 }));

    await expect(getShotgridAccessToken()).rejects.toThrow(
      "ShotGrid sign-in failed (401)"
    );
  });
});
