import { shotgridConfig } from "../config/shotgridConfig";
import type { ShotgridRecord } from "../helpers/shotgridRecords";
import { getShotgridAccessToken } from "./getShotgridAccessToken";

interface ShotgridSearch {
  entity: string; // plural snake_case, e.g. "shots"
  filters: unknown[]; // e.g. [["sg_status_list", "is", "ip"]]
  fields: string[];
  sort?: string;
}

const pageSize = 500;
const maxPages = 20; // safety stop at 10,000 records

// Finds every record matching the filters, reading page after page.
export async function searchShotgrid(
  search: ShotgridSearch
): Promise<ShotgridRecord[]> {
  const records: ShotgridRecord[] = [];

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const query = new URLSearchParams({
      fields: search.fields.join(","),
      "page[size]": String(pageSize),
      "page[number]": String(pageNumber),
    });
    if (search.sort) query.set("sort", search.sort);

    const token = await getShotgridAccessToken();
    const response = await fetch(
      `${shotgridConfig.siteUrl}${shotgridConfig.apiPath}/entity/${search.entity}/_search?${query}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd+shotgun.api3_array+json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filters: search.filters }),
      }
    );
    if (!response.ok) {
      throw new Error(
        `ShotGrid search failed (${response.status}) for ${search.entity}`
      );
    }

    const page =
      ((await response.json()) as { data?: ShotgridRecord[] }).data ?? [];
    records.push(...page);
    if (page.length < pageSize) break; // that was the last page
  }

  return records;
}
