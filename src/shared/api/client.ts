import { getApiBaseUrl } from "./config";
import { ApiError } from "./error";
import { CONNECTIVITY_MESSAGES } from "../lib/connectivityMessages";

let refreshInFlight: Promise<boolean> | null = null;

function assertOnline(): void {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error(CONNECTIVITY_MESSAGES.offline);
  }
}

async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  refreshInFlight = (async () => {
    try {
      assertOnline();
      const base = getApiBaseUrl();
      const r = await fetch(`${base}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      return r.ok;
    } catch {
      return false;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function apiFetchOnce(
  url: string | URL,
  init: RequestInit,
  retried: boolean,
): Promise<Response> {
  const response = await fetch(url, init);
  if (response.ok) {
    return response;
  }
  if (response.status === 401 && !retried) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return apiFetchOnce(url, init, true);
    }
  }
  return response;
}

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
  if (typeof parsed !== "object" || parsed === null || !("message" in parsed)) {
    return null;
  }
  const msg = (parsed as { message: unknown }).message;
  if (typeof msg === "string") {
    return msg;
  }
  if (Array.isArray(msg) && msg.every((m) => typeof m === "string")) {
    return msg.join(" ");
  }
  return null;
}

export async function apiFetch(url: string | URL, init: RequestInit = {}): Promise<Response> {
  assertOnline();
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const merged: RequestInit = {
    ...init,
    credentials: "include",
    headers,
  };

  const response = await apiFetchOnce(url, merged, false);

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
