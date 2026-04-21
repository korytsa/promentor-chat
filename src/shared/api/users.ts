import { apiJson } from "./client";
import { getApiBaseUrl } from "./config";
import type { UserSearchResultDto, UsersListPageDto } from "./types/user";

export function usersBasePath(): string {
  return `${getApiBaseUrl()}/users`;
}

export async function fetchUsers(
  params?: { limit?: number; offset?: number },
  init?: RequestInit,
): Promise<UsersListPageDto> {
  const search = new URLSearchParams();
  if (params?.limit != null) {
    search.set("limit", String(params.limit));
  }
  if (params?.offset != null) {
    search.set("offset", String(params.offset));
  }
  const qs = search.toString();
  return apiJson<UsersListPageDto>(`${usersBasePath()}${qs ? `?${qs}` : ""}`, init ?? {});
}

export async function searchUsers(
  q: string,
  limit = 20,
  init?: RequestInit,
): Promise<UserSearchResultDto[]> {
  const params = new URLSearchParams({ q: q.trim(), limit: String(limit) });
  return apiJson<UserSearchResultDto[]>(`${usersBasePath()}/search?${params}`, init ?? {});
}
