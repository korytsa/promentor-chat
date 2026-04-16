import { useEffect, useState } from "react";
import type { ParseApiFailureOptions } from "../api/parseApiFailure";
import { parseApiFailure, searchUsers } from "../api";
import type { UserSearchResultDto } from "../api/types/user";

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

    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }
      setLoading(true);
      setError(null);
    });

    void searchUsers(debouncedQuery)
      .then((rows) => {
        if (cancelled) {
          return;
        }
        setDtos(rows);
      })
      .catch((err: unknown) => {
        if (cancelled) {
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
