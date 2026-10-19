// The shape ShotGrid returns for every record.
export interface ShotgridRecord {
  id: number;
  type: string;
  attributes?: Record<string, unknown>; // plain fields
  relationships?: Record<string, unknown>; // links to other records
}

export interface ShotgridLink {
  id: number;
  name: string;
  type: string;
}

export function readText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

// A linked record arrives either bare ({ id, name, type }) or wrapped ({ data: { ... } }).
export function readLink(link: unknown): ShotgridLink | null {
  if (!link || typeof link !== "object") return null;
  const record: unknown =
    "data" in link ? (link as { data: unknown }).data : link;
  if (!record || typeof record !== "object") return null;

  const { id, name, type } = record as {
    id?: unknown;
    name?: unknown;
    type?: unknown;
  };
  if (typeof id !== "number" || typeof name !== "string") return null;
  return { id, name, type: typeof type === "string" ? type : "" };
}

export function readLinkedName(link: unknown): string | null {
  return readLink(link)?.name ?? null;
}

// A field linking to several records arrives as a list, bare or wrapped in { data: [...] }.
export function readLinks(links: unknown): ShotgridLink[] {
  const list: unknown =
    links && typeof links === "object" && "data" in links
      ? (links as { data: unknown }).data
      : links;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item) => readLink(item) ?? []);
}

export function readNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

// A field on a record may sit under attributes or relationships depending on its type.
export function readField(record: ShotgridRecord, field: string): unknown {
  return record.attributes?.[field] ?? record.relationships?.[field];
}

// File fields (like an uploaded movie) arrive as an object holding a temporary link.
export function readFileUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const file: unknown =
    "data" in value ? (value as { data: unknown }).data : value;
  if (!file || typeof file !== "object") return null;
  return readText((file as { url?: unknown }).url);
}
