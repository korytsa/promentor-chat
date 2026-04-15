import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchRooms, parseApiFailure } from "../../../shared/api";
import type { ChatSearchOption, Conversation } from "../../../entities/chat";
import {
  mapRoomListItemToConversation,
  sortRoomsByUpdatedAtDesc,
} from "../../../entities/chat/model/mapRoomListItem";
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
  }, []);

  const q = query.trim().toLowerCase();

  const { directMessages, groupMessages, searchOptions } = useMemo(() => {
    const { directMessages: d, groupMessages: g } = partitionConversations(conversations);
    return {
      directMessages: d,
      groupMessages: g,
      searchOptions: toSearchOptions([...d, ...g]),
    };
  }, [conversations]);

  const filteredUsers = useMemo(
    () => searchOptions.filter((u) => u.name.toLowerCase().includes(q)),
    [searchOptions, q],
  );

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

  return {
    search: {
      query,
      setQuery,
      isOpen,
      setIsOpen,
      containerRef,
      filteredUsers,
    },
    directMessages,
    groupMessages,
    categoryClassName: SIDEBAR_CONVERSATION_CATEGORY_CLASS,
    visibilityClassName,
    status,
    errorMessage,
  };
}
