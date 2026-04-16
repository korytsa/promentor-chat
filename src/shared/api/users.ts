import { apiJson } from "./client";
import { getApiBaseUrl } from "./config";
import type { UserSearchResultDto } from "./types/user";

export function usersBasePath(): string {
  return `${getApiBaseUrl()}/users`;
}

export async function searchUsers(q: string, limit = 20): Promise<UserSearchResultDto[]> {
  const params = new URLSearchParams({ q: q.trim(), limit: String(limit) });
  return apiJson<UserSearchResultDto[]>(`${usersBasePath()}/search?${params}`);
}
