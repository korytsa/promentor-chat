export function readSocketErrorMessage(raw: unknown, fallback: string): string {
  if (typeof raw !== "object" || raw === null || !("message" in raw)) {
    return fallback;
  }
  const msg = (raw as { message: unknown }).message;
  if (typeof msg === "string") {
    return msg;
  }
  if (Array.isArray(msg) && msg.every((m) => typeof m === "string")) {
    return msg.join(" ");
  }
  return fallback;
}
