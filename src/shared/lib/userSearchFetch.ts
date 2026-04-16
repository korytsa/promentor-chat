import { ApiError } from "../api/error";
import { searchUsers } from "../api";
import type { UserSearchResultDto } from "../api/types/user";
import { USER_SEARCH_429_RETRY_DELAY_MS } from "./constants/userSearch";

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      signal.removeEventListener("abort", onAbort);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort);
  });
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}


export async function searchUsersWith429Retry(
  q: string,
  limit: number,
  signal: AbortSignal,
): Promise<UserSearchResultDto[]> {
  try {
    return await searchUsers(q, limit, { signal });
  } catch (err) {
    if (isAbortError(err)) {
      throw err;
    }
    if (err instanceof ApiError && err.status === 429 && !signal.aborted) {
      await sleep(USER_SEARCH_429_RETRY_DELAY_MS, signal);
      return await searchUsers(q, limit, { signal });
    }
    throw err;
  }
}
