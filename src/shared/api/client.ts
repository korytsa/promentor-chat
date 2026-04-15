import { ApiError } from "./error";

function readErrorMessageFromBody(bodyText: string): string | null {
  if (!bodyText) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return null;
  }
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "message" in parsed &&
    typeof (parsed as { message: unknown }).message === "string"
  ) {
    return (parsed as { message: string }).message;
  }
  return null;
}

export async function apiFetch(url: string | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers,
  });

  if (response.ok) {
    return response;
  }

  const bodyText = await response.text();
  const messageFromJson = readErrorMessageFromBody(bodyText);
  const message = messageFromJson ?? (response.statusText || `HTTP ${response.status}`);

  throw new ApiError(response.status, message);
}

export async function apiJson<T>(url: string | URL, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(url, init);
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
