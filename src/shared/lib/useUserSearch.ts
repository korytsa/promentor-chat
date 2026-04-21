import { useEffect, useState } from "react";
import type { ParseApiFailureOptions } from "../api/parseApiFailure";
import { parseApiFailure } from "../api";
import type { UserSearchResultDto } from "../api/types/user";
import { USER_SEARCH_RESULT_LIMIT } from "./constants/userSearch";
import { searchUsersWith429Retry, isAbortError } from "./userSearchFetch";

type UseUserSearchParams = {
  debouncedQuery: string;
  minQueryLength: number;
  parseFailure: ParseApiFailureOptions;
  excludeUserId?: string;
};

export function useUserSearch({
  debouncedQuery,
  minQueryLength,
  parseFailure,
  excludeUserId,
}: UseUserSearchParams) {
  const [dtos, setDtos] = useState<UserSearchResultDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedQuery.length < minQueryLength) {
      return;
    }

    const ac = new AbortController();
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });

    void searchUsersWith429Retry(debouncedQuery, USER_SEARCH_RESULT_LIMIT, ac.signal)
      .then((rows) => {
        if (cancelled) {
          return;
        }
        const filtered =
          excludeUserId != null && excludeUserId !== ""
            ? rows.filter((r) => r.id !== excludeUserId)
            : rows;
        setDtos(filtered);
      })
      .catch((err: unknown) => {
        if (cancelled || isAbortError(err)) {
          return;
        }
        setDtos([]);
        setError(parseApiFailure(err, parseFailure));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [debouncedQuery, minQueryLength, parseFailure, excludeUserId]);

  const active = debouncedQuery.length >= minQueryLength;

  return {
    dtos,
    loading: active && loading,
    error: active ? error : null,
    active,
  };
}
