import { useCallback, useState } from "react";
import { markRoomRead, parseApiFailure, sendRoomMessage } from "../../../shared/api";
import type { MessageDto } from "../../../shared/api/types/message";
import type { ChatRoomMessageView } from "../../../entities/chat";
import {
  buildOptimisticOwnMessage,
  mapMessageDtoToView,
  mergeMessageList,
} from "../../../entities/chat/model/mapMessageDto";
import { CHAT_ROOM_SEND_MESSAGE_FAILURE } from "./constants";
import { loadInitialRoomMessages } from "./chatRoomMessageUtils";
import type { RemoteMessages } from "./remoteMessagesPatch";

type Params = {
  roomId: string | undefined;
  sessionFullName: string | undefined;
  patchReadyItems: (update: (items: ChatRoomMessageView[]) => ChatRoomMessageView[]) => void;
  scrollToLatestMessage: () => void;
  sendMessageViaSocket: (message: string, clientMessageId?: string) => Promise<boolean>;
  setRemote: React.Dispatch<React.SetStateAction<RemoteMessages | null>>;
};

function buildClientMessageId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export function useMessageSend({
  roomId,
  sessionFullName,
  patchReadyItems,
  scrollToLatestMessage,
  sendMessageViaSocket,
  setRemote,
}: Params) {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      if (!roomId) {
        return;
      }
      setSendError(null);
      const clientMessageId = buildClientMessageId();
      const authorName = sessionFullName?.trim() || "You";
      const optimistic = buildOptimisticOwnMessage(text, authorName, clientMessageId);

      patchReadyItems((items) => mergeMessageList(items, optimistic));
      scrollToLatestMessage();

      setIsSending(true);
      try {
        let sentViaSocket = false;
        try {
          sentViaSocket = await sendMessageViaSocket(text, clientMessageId);
        } catch {
          sentViaSocket = false;
        }
        let created: MessageDto | null = null;
        if (!sentViaSocket) {
          created = await sendRoomMessage(roomId, { message: text });
        }
        const optimisticId = optimistic.id;
        if (created) {
          patchReadyItems((items) => {
            const next = items.filter((m) => m.id !== optimisticId);
            return mergeMessageList(next, mapMessageDtoToView(created));
          });
          void markRoomRead(roomId, { messageId: created.id }).catch(() => {});
        } else {
          const { items: latestItems, pagination } = await loadInitialRoomMessages(roomId);
          setRemote((prev) => {
            if (!prev || prev.roomId !== roomId || prev.kind !== "ready") {
              return prev;
            }
            const merged = latestItems.reduce<ChatRoomMessageView[]>(
              (acc, item) => mergeMessageList(acc, item),
              prev.items,
            );
            return {
              roomId,
              kind: "ready",
              items: merged,
              pagination: {
                total: pagination.total,
                oldestLoadedOffset: prev.pagination.oldestLoadedOffset,
              },
            };
          });
        }
      } catch (err: unknown) {
        patchReadyItems((items) => items.filter((m) => m.id !== optimistic.id));
        setSendError(parseApiFailure(err, CHAT_ROOM_SEND_MESSAGE_FAILURE));
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [
      roomId,
      sessionFullName,
      patchReadyItems,
      scrollToLatestMessage,
      sendMessageViaSocket,
      setRemote,
    ],
  );

  return { send, isSending, sendError };
}
