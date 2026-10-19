import { shotgridConfig } from "../config/shotgridConfig";
import type { ShotgridRecord } from "../helpers/shotgridRecords";
import { getShotgridAccessToken } from "./getShotgridAccessToken";

// Changes fields on one record and returns it with the requested fields filled in.
export async function updateShotgridRecord(
  entity: string, // plural snake_case, e.g. "tasks"
  recordId: number,
  changes: Record<string, unknown>,
  returnFields: string[]
): Promise<ShotgridRecord> {
  const token = await getShotgridAccessToken();
  const query = new URLSearchParams({
    "options[fields]": returnFields.join(","),
  });

  const response = await fetch(
    `${shotgridConfig.siteUrl}${shotgridConfig.apiPath}/entity/${entity}/${recordId}?${query}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(changes),
    }
  );

  if (response.status === 403)
    throw new Error(
      "ShotGrid refused the change: the API script can't edit this."
    );
  if (!response.ok)
    throw new Error(
      `ShotGrid update failed (${response.status}) for ${entity} ${recordId}`
    );

  const result = (await response.json()) as { data?: ShotgridRecord };
  if (!result.data)
    throw new Error("ShotGrid returned no record after the update.");
  return result.data;
}
