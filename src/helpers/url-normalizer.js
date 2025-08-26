export function normalizeUrl(url) {
  if (!url) return "";
  return url.split("?")[0];
}
