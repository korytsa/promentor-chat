export function readSocketErrorMessage(raw: unknown, fallback: string): string {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "message" in raw &&
    typeof (raw as { message: unknown }).message === "string"
  ) {
    return (raw as { message: string }).message;
  }
  return fallback;
}
