import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createRoom, fetchRooms, parseApiFailure } from "../../../shared/api";
import type { ChatSearchOption, Conversation } from "../../../entities/chat";
import {
  mapRoomListItemToConversation,
  sortRoomsByUpdatedAtDesc,
} from "../../../entities/chat/model/mapRoomListItem";
import { mapUserSearchDtoToChatOption } from "../../../entities/chat/model/mapUserSearchDto";
import {
  CHAT_SEARCH_DM_FAILURE,
  CHAT_SIDEBAR_USER_SEARCH_FAILURE,
} from "../../../pages/chat/model/constants";
import { CHAT_ROOMS_INVALIDATE_EVENT } from "../../../shared/lib/chatRoomsInvalidate";
import { USER_SEARCH_DEBOUNCE_MS, USER_SEARCH_MIN_QUERY_LEN } from "../../../shared/lib/constants/userSearch";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue";
import { useUserSearch } from "../../../shared/lib/useUserSearch";
import { SIDEBAR_CONVERSATION_CATEGORY_CLASS } from "./constants";

type LoadStatus = "loading" | "ready" | "error";

function partitionConversations(conversations: Conversation[]) {
  const directMessages: Conversation[] = [];
  const groupMessages: Conversation[] = [];
  for (const c of conversations) {
    if (c.category === "direct") {
      directMessages.push(c);
    } else {
      groupMessages.push(c);
    }
  }
  return { directMessages, groupMessages };
}

function toSearchOptions(conversations: Conversation[]): ChatSearchOption[] {
  return conversations.map((c) => ({
    id: c.id,
    name: c.title,
    avatarUrl: c.avatarUrls[0] ?? "",
  }));
}

export function useChatSidebarModel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQueryState] = useState("");
  const debouncedQuery = useDebouncedValue(query, USER_SEARCH_DEBOUNCE_MS);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [dmCreateError, setDmCreateError] = useState<string | null>(null);
  const [roomsRefetchNonce, setRoomsRefetchNonce] = useState(0);

  const setQuery = useCallback((value: string) => {
    setDmCreateError(null);
    setQueryState(value);
  }, []);

  const { dtos, loading: userSearchLoading, error: userSearchError, active: userSearchActive } =
    useUserSearch({
      debouncedQuery,
      minQueryLength: USER_SEARCH_MIN_QUERY_LEN,
      parseFailure: CHAT_SIDEBAR_USER_SEARCH_FAILURE,
    });

  const remoteUserOptions = useMemo(
    () => (userSearchActive ? dtos.map(mapUserSearchDtoToChatOption) : []),
    [userSearchActive, dtos],
  );

  useEffect(() => {
    const onInvalidate = () => {
      setRoomsRefetchNonce((n) => n + 1);
    };
    window.addEventListener(CHAT_ROOMS_INVALIDATE_EVENT, onInvalidate);
    return () => window.removeEventListener(CHAT_ROOMS_INVALIDATE_EVENT, onInvalidate);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchRooms()
      .then((items) => {
        if (cancelled) {
          return;
        }
        const mapped = sortRoomsByUpdatedAtDesc(items).map(mapRoomListItemToConversation);
        setConversations(mapped);
        setErrorMessage(null);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setConversations([]);
        setErrorMessage(
          parseApiFailure(err, {
            fallback: "Could not load conversations.",
            unauthorized: "Sign in to load conversations.",
          }),
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [roomsRefetchNonce]);

  const q = query.trim().toLowerCase();

  const { directMessages, groupMessages, searchOptions } = useMemo(() => {
    const { directMessages: d, groupMessages: g } = partitionConversations(conversations);
    return {
      directMessages: d,
      groupMessages: g,
      searchOptions: toSearchOptions([...d, ...g]),
    };
  }, [conversations]);

  const filteredUsers = useMemo(() => {
    const localMatches = searchOptions.filter((u) => u.name.toLowerCase().includes(q));
    if (!userSearchActive) {
      return localMatches;
    }
    return [...localMatches, ...remoteUserOptions];
  }, [searchOptions, q, userSearchActive, remoteUserOptions]);

  const isListRoute = location.pathname === "/" || location.pathname === "/chat";
  const visibilityClassName = isListRoute ? "flex md:flex" : "hidden md:flex";

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const onSelectSearchOption = useCallback(
    async (option: ChatSearchOption): Promise<boolean> => {
      if (option.isUserOnly) {
        try {
          const room = await createRoom({ type: "private", memberIds: [option.id] });
          navigate(`/chat/${room.id}`);
          return true;
        } catch (err: unknown) {
          setDmCreateError(parseApiFailure(err, CHAT_SEARCH_DM_FAILURE));
          return false;
        }
      }

      navigate(`/chat/${option.id}`);
      return true;
    },
    [navigate],
  );

  return {
    search: {
      query,
      setQuery,
      isOpen,
      setIsOpen,
      containerRef,
      filteredUsers,
      onSelectSearchOption,
      userSearchLoading,
      userSearchError,
      dmCreateError,
    },
    directMessages,
    groupMessages,
    categoryClassName: SIDEBAR_CONVERSATION_CATEGORY_CLASS,
    visibilityClassName,
    status,
    errorMessage,
  };
}
