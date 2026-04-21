import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Conversation } from "../../../entities/chat";
import {
  mapRoomListItemToConversation,
  sortRoomsByUpdatedAtDesc,
} from "../../../entities/chat/model/mapRoomListItem";
import { fetchRooms, parseApiFailure } from "../../../shared/api";
import { CHAT_ROOMS_INVALIDATE_EVENT } from "../../../shared/lib/chatRoomsInvalidate";
import { getOrCreateChatSocket } from "../../../shared/lib/chatSocket";
import { CHAT_SOCKET_EVENTS } from "../../../shared/lib/chatSocketEvents";
import { partitionConversations } from "./sidebarSearchUtils";

type LoadStatus = "loading" | "ready" | "error";
const ROOMS_REFETCH_THROTTLE_MS = 400;

export function useRoomsList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomsRefetchNonce, setRoomsRefetchNonce] = useState(0);
  const lastRefetchAtRef = useRef(0);
  const trailingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefetch = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRefetchAtRef.current;
    if (elapsed >= ROOMS_REFETCH_THROTTLE_MS) {
      lastRefetchAtRef.current = now;
      setRoomsRefetchNonce((n) => n + 1);
      return;
    }
    if (trailingTimerRef.current) {
      return;
    }
    const waitMs = ROOMS_REFETCH_THROTTLE_MS - elapsed;
    trailingTimerRef.current = setTimeout(() => {
      trailingTimerRef.current = null;
      lastRefetchAtRef.current = Date.now();
      setRoomsRefetchNonce((n) => n + 1);
    }, waitMs);
  }, []);

  useEffect(() => {
    const onInvalidate = () => {
      scheduleRefetch();
    };
    window.addEventListener(CHAT_ROOMS_INVALIDATE_EVENT, onInvalidate);
    return () => window.removeEventListener(CHAT_ROOMS_INVALIDATE_EVENT, onInvalidate);
  }, [scheduleRefetch]);

  useEffect(() => {
    const socket = getOrCreateChatSocket();
    if (!socket) {
      return;
    }
    const onRoomsChanged = () => {
      scheduleRefetch();
    };
    socket.on(CHAT_SOCKET_EVENTS.roomsChanged, onRoomsChanged);
    return () => {
      socket.off(CHAT_SOCKET_EVENTS.roomsChanged, onRoomsChanged);
    };
  }, [scheduleRefetch]);

  useEffect(() => {
    return () => {
      if (trailingTimerRef.current) {
        clearTimeout(trailingTimerRef.current);
      }
    };
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

  const { directMessages, groupMessages } = useMemo(
    () => partitionConversations(conversations),
    [conversations],
  );

  return { status, errorMessage, directMessages, groupMessages, conversations };
}
