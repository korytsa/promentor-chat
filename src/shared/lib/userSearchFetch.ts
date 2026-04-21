import { ApiError } from "../api/error";
import { searchUsers } from "../api";
import type { UserSearchResultDto } from "../api/types/user";
import { USER_SEARCH_429_RETRY_DELAY_MS } from "./constants/userSearch";

const USER_SEARCH_RATE_LIMITED_MESSAGE = "Too many searches. Wait a moment and try again.";

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
  const maxRetries = 3;
  for (let attempt = 0; ; attempt++) {
    try {
      return await searchUsers(q, limit, { signal });
    } catch (err) {
      if (isAbortError(err)) {
        throw err;
      }
      const isRateLimited = err instanceof ApiError && err.status === 429 && !signal.aborted;
      if (!isRateLimited || attempt >= maxRetries - 1) {
        if (isRateLimited) {
          throw new ApiError(429, USER_SEARCH_RATE_LIMITED_MESSAGE);
        }
        throw err;
      }
      const delay = USER_SEARCH_429_RETRY_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay, signal);
    }
  }
}
