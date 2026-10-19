// ShotGrid is optional: the server still starts when these aren't set.
const siteUrl = (process.env.SHOTGRID_SITE_URL ?? "").replace(/\/+$/, ""); // no trailing slash
const scriptName = process.env.SHOTGRID_SCRIPT_NAME ?? "";
const scriptKey = process.env.SHOTGRID_SCRIPT_KEY ?? "";

export const shotgridConfig = {
  siteUrl, // e.g. https://your-studio.shotgrid.autodesk.com
  scriptName,
  scriptKey,
  apiPath: "/api/v1.1",
  isConfigured: Boolean(siteUrl && scriptName && scriptKey),
  cacheSeconds: 120,
};
