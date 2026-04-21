import { useEffect, useMemo, useState } from "react";
import type { Conversation } from "../../../entities/chat";
import { mapRoomListItemToConversation, sortRoomsByUpdatedAtDesc } from "../../../entities/chat/model/mapRoomListItem";
import { fetchRooms, parseApiFailure } from "../../../shared/api";
import { CHAT_ROOMS_INVALIDATE_EVENT } from "../../../shared/lib/chatRoomsInvalidate";
import { getOrCreateChatSocket } from "../../../shared/lib/chatSocket";
import { CHAT_SOCKET_EVENTS } from "../../../shared/lib/chatSocketEvents";
import { partitionConversations } from "./sidebarSearchUtils";

type LoadStatus = "loading" | "ready" | "error";

export function useRoomsList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomsRefetchNonce, setRoomsRefetchNonce] = useState(0);

  useEffect(() => {
    const onInvalidate = () => {
      setRoomsRefetchNonce((n) => n + 1);
    };
    window.addEventListener(CHAT_ROOMS_INVALIDATE_EVENT, onInvalidate);
    return () => window.removeEventListener(CHAT_ROOMS_INVALIDATE_EVENT, onInvalidate);
  }, []);

  useEffect(() => {
    const socket = getOrCreateChatSocket();
    if (!socket) {
      return;
    }
    const onRoomsChanged = () => {
      setRoomsRefetchNonce((n) => n + 1);
    };
    socket.on(CHAT_SOCKET_EVENTS.roomsChanged, onRoomsChanged);
    return () => {
      socket.off(CHAT_SOCKET_EVENTS.roomsChanged, onRoomsChanged);
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
