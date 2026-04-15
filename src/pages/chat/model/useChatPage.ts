import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

export function useChatPage(): ChatPageState {
  const { chatId } = useParams();
  const [remote, setRemote] = useState<RemoteState | null>(null);

  useEffect(() => {
    if (!chatId) {
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
