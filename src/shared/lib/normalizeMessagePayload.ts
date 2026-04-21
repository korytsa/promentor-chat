export function toIsoString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  return null;
}

export function toStringId(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return null;
}

export function normalizeMessagePayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const root = raw as Record<string, unknown>;
  const candidates = [root.message, root.payload, root.data];
  for (const c of candidates) {
    const nested = toRecord(c);
    if (nested) {
      return nested;
    }
  }
  return root;
}
