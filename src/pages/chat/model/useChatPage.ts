import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError, fetchRoomById, parseApiFailure } from "../../../shared/api";
import type { Conversation } from "../../../entities/chat";
import { mapRoomListItemToConversation } from "../../../entities/chat/model/mapRoomListItem";
import { CHAT_ROOMS_INVALIDATE_EVENT } from "../../../shared/lib/chatRoomsInvalidate";
import { getOrCreateChatSocket } from "../../../shared/lib/chatSocket";
import { CHAT_SOCKET_EVENTS } from "../../../shared/lib/chatSocketEvents";

export type ChatPageReadyViewModel = {
  activeConversation: Conversation;
};

export type ChatPageState =
  | { status: "empty" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; viewModel: ChatPageReadyViewModel };

type RemoteState =
  | { chatId: string; kind: "ready"; viewModel: ChatPageReadyViewModel }
  | { chatId: string; kind: "error"; message: string };

const UUID_V4ISH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useChatPage(): ChatPageState {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [remote, setRemote] = useState<RemoteState | null>(null);
  const [roomsInvalidateNonce, setRoomsInvalidateNonce] = useState(0);

  useEffect(() => {
    const onInvalidate = () => {
      setRoomsInvalidateNonce((n) => n + 1);
    };
    window.addEventListener(CHAT_ROOMS_INVALIDATE_EVENT, onInvalidate);
    return () => window.removeEventListener(CHAT_ROOMS_INVALIDATE_EVENT, onInvalidate);
  }, []);

  useEffect(() => {
    const socket = getOrCreateChatSocket();
    if (!socket || !chatId) {
      return;
    }
    const onRoomsChanged = (raw: unknown) => {
      if (!raw || typeof raw !== "object") {
        return;
      }
      const payload = raw as { roomId?: unknown };
      if (payload.roomId !== chatId) {
        return;
      }
      setRoomsInvalidateNonce((n) => n + 1);
    };
    socket.on(CHAT_SOCKET_EVENTS.roomsChanged, onRoomsChanged);
    return () => {
      socket.off(CHAT_SOCKET_EVENTS.roomsChanged, onRoomsChanged);
    };
  }, [chatId]);

  useEffect(() => {
    if (!chatId) {
      return;
    }
    if (UUID_V4ISH_RE.test(chatId)) {
      return;
    }
    navigate("/chat", { replace: true });
  }, [chatId, navigate]);

  useEffect(() => {
    if (!chatId) {
      return;
    }
    if (!UUID_V4ISH_RE.test(chatId)) {
      return;
    }
    let cancelled = false;

    fetchRoomById(chatId)
      .then((detail) => {
        if (cancelled) {
          return;
        }
        setRemote({
          chatId,
          kind: "ready",
          viewModel: {
            activeConversation: mapRoomListItemToConversation(detail),
          },
        });
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          navigate("/chat", { replace: true });
          return;
        }
        setRemote({
          chatId,
          kind: "error",
          message: parseApiFailure(err, {
            fallback: "Could not load conversation.",
            unauthorized: "Sign in to view this conversation.",
            notFound: "Conversation not found.",
          }),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [chatId, roomsInvalidateNonce, navigate]);

  if (!chatId) {
    return { status: "empty" };
  }

  if (!remote || remote.chatId !== chatId) {
    return { status: "loading" };
  }

  if (remote.kind === "error") {
    return { status: "error", message: remote.message };
  }

  return { status: "ready", viewModel: remote.viewModel };
}
