import { apiJson } from "./client";
import { getApiBaseUrl } from "./config";
import type { AuthUserResponseDto } from "./types/user";

export function authBasePath(): string {
  return `${getApiBaseUrl()}/auth`;
}

export async function fetchAuthMe(init?: RequestInit): Promise<AuthUserResponseDto> {
  return apiJson<AuthUserResponseDto>(`${authBasePath()}/me`, init ?? {});
}
