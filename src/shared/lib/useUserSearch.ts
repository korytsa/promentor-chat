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
};

export function useUserSearch({
  debouncedQuery,
  minQueryLength,
  parseFailure,
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
        setDtos(rows);
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
  }, [debouncedQuery, minQueryLength, parseFailure]);

  const active = debouncedQuery.length >= minQueryLength;

  return {
    dtos,
    loading: active && loading,
    error: active ? error : null,
    active,
  };
}
