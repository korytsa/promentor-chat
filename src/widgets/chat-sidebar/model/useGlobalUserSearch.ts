import { useCallback, useMemo, useRef, useState } from "react";
import type { Conversation } from "../../../entities/chat";
import {
  mapAuthUserToChatOption,
  mapUserSearchDtoToChatOption,
} from "../../../entities/chat/model/mapUserSearchDto";
import {
  CHAT_SIDEBAR_USERS_DIRECTORY_FAILURE,
  CHAT_SIDEBAR_USER_SEARCH_FAILURE,
} from "../../../pages/chat/model/constants";
import {
  USER_SEARCH_DEBOUNCE_MS,
  USER_SEARCH_MIN_QUERY_LEN,
} from "../../../shared/lib/constants/userSearch";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue";
import { useUserSearch } from "../../../shared/lib/useUserSearch";
import { useUsersDirectory } from "../../../shared/lib/useUsersDirectory";
import { toSearchOptions, withoutRemoteDuplicatesAgainstDirectRooms } from "./sidebarSearchUtils";

type Params = {
  conversations: Conversation[];
  excludeUserId?: string;
};

export function useGlobalUserSearch({ conversations, excludeUserId }: Params) {
  const [query, setQueryState] = useState("");
  const debouncedQuery = useDebouncedValue(query, USER_SEARCH_DEBOUNCE_MS);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dmCreateError, setDmCreateError] = useState<string | null>(null);

  const setQuery = useCallback((value: string) => {
    setDmCreateError(null);
    setQueryState(value);
  }, []);

  const {
    dtos,
    loading: userSearchLoading,
    error: userSearchError,
    active: userSearchActive,
  } = useUserSearch({
    debouncedQuery,
    minQueryLength: USER_SEARCH_MIN_QUERY_LEN,
    parseFailure: CHAT_SIDEBAR_USER_SEARCH_FAILURE,
    excludeUserId,
  });

  const directoryEnabled = isOpen && query.trim().length < USER_SEARCH_MIN_QUERY_LEN;
  const {
    items: directoryUsers,
    loading: directoryLoading,
    error: directoryError,
  } = useUsersDirectory({
    enabled: directoryEnabled,
    excludeUserId,
    parseFailure: CHAT_SIDEBAR_USERS_DIRECTORY_FAILURE,
  });

  const q = query.trim().toLowerCase();
  const searchOptions = useMemo(() => toSearchOptions(conversations), [conversations]);
  const remoteUserOptions = useMemo(
    () => (userSearchActive ? dtos.map(mapUserSearchDtoToChatOption) : []),
    [userSearchActive, dtos],
  );
  const directoryOptions = useMemo(
    () => directoryUsers.map(mapAuthUserToChatOption),
    [directoryUsers],
  );

  const filteredUsers = useMemo(() => {
    const localMatches = searchOptions.filter((u) => u.name.toLowerCase().includes(q));
    if (userSearchActive) {
      const remotes = withoutRemoteDuplicatesAgainstDirectRooms(remoteUserOptions, localMatches);
      return [...localMatches, ...remotes];
    }
    if (directoryEnabled && directoryOptions.length > 0) {
      const directoryDeduped = withoutRemoteDuplicatesAgainstDirectRooms(
        directoryOptions,
        localMatches,
      );
      return [...directoryDeduped, ...localMatches];
    }
    return localMatches;
  }, [searchOptions, q, userSearchActive, remoteUserOptions, directoryEnabled, directoryOptions]);

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    containerRef,
    filteredUsers,
    userSearchLoading,
    userSearchError,
    directoryLoading,
    directoryError,
    dmCreateError,
    setDmCreateError,
  };
}
