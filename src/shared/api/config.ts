export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("VITE_API_URL is not set.");
  }
  return raw.replace(/\/+$/, "");
}
