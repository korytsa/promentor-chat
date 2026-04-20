type AuthRole = import("shell/authBridge").AuthRole;

export class AuthHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthHttpError";
  }
}

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
  avatarUrl?: string | null;
};

function apiOrigin(): string {
  const fromEnv = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }
  if (typeof globalThis !== "undefined" && "location" in globalThis) {
    return (globalThis as unknown as { location: { origin: string } }).location.origin.replace(
      /\/$/,
      "",
    );
  }
  return "";
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const origin = apiOrigin();
  const url = origin ? `${origin}${path}` : path;
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : res.statusText || "Request failed";
    throw new AuthHttpError(msg, res.status);
  }
  return data as T;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function normalizeCurrentUser(user: CurrentUser | null | undefined): CurrentUser | null {
  if (!user || !isNonEmptyString(user.id) || !isNonEmptyString(user.email)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
  };
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const raw = await requestJson<CurrentUser>("/auth/me", { method: "GET" });
  const user = normalizeCurrentUser(raw);
  if (!user) {
    throw new Error("Profile response was empty.");
  }
  return user;
}
