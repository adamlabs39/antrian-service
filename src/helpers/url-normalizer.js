export function normalizeUrl(url) {
  if (!url) return "";
  // buang query params
  return url.split("?")[0];
}
