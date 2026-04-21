import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchRoomById, parseApiFailure } from "../../../shared/api";
import type { Conversation } from "../../../entities/chat";
import { mapRoomListItemToConversation } from "../../../entities/chat/model/mapRoomListItem";

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
  }, [chatId]);

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
