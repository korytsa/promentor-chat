import { useEffect, useState } from "react";
import type { ParseApiFailureOptions } from "../api/parseApiFailure";
import { fetchUsers, parseApiFailure } from "../api";
import type { AuthUserResponseDto } from "../api/types/user";
import { USERS_DIRECTORY_PAGE_SIZE } from "./constants/userSearch";

type UseUsersDirectoryParams = {
  enabled: boolean;
  excludeUserId?: string;
  parseFailure: ParseApiFailureOptions;
};

export function useUsersDirectory({
  enabled,
  excludeUserId,
  parseFailure,
}: UseUsersDirectoryParams) {
  const [items, setItems] = useState<AuthUserResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const ac = new AbortController();

    void Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });

    void fetchUsers({ limit: USERS_DIRECTORY_PAGE_SIZE, offset: 0 }, { signal: ac.signal })
      .then((page) => {
        if (cancelled) {
          return;
        }
        const filtered = excludeUserId
          ? page.items.filter((u) => u.id !== excludeUserId)
          : page.items;
        setItems(filtered);
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) {
          return;
        }
        setItems([]);
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
  }, [enabled, excludeUserId, parseFailure]);

  return {
    items,
    loading: enabled && loading,
    error: enabled ? error : null,
  };
}
