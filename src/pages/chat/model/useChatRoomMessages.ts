import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchRoomMessages,
  markRoomRead,
  parseApiFailure,
  sendRoomMessage,
} from "../../../shared/api";
import { useHostAuthSession } from "../../../features/auth";
import type { ChatRoomMessageView } from "../../../entities/chat";
import {
  buildOptimisticOwnMessage,
  mapMessageDtoToView,
  mergeMessageList,
} from "../../../entities/chat/model/mapMessageDto";
import {
  CHAT_ROOM_LOAD_MESSAGES_FAILURE,
  CHAT_ROOM_SEND_MESSAGE_FAILURE,
} from "./constants";
import { patchReadyForRoom, type RemoteMessages } from "./remoteMessagesPatch";

export function useChatRoomMessages(roomId: string | undefined) {
  const { session } = useHostAuthSession();
  const [remote, setRemote] = useState<RemoteMessages | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      return;
    }
    let cancelled = false;

    fetchRoomMessages(roomId)
      .then((page) => {
        if (cancelled) {
          return;
        }
        setRemote({
          roomId,
          kind: "ready",
          items: page.items.map(mapMessageDtoToView),
        });
        void markRoomRead(roomId, {}).catch(() => {});
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setRemote({
          roomId,
          kind: "error",
          message: parseApiFailure(err, CHAT_ROOM_LOAD_MESSAGES_FAILURE),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const send = useCallback(
    async (text: string) => {
      if (!roomId) {
        return;
      }
      setSendError(null);
      const authorName = session.user?.fullName?.trim() || "You";
      const optimistic = buildOptimisticOwnMessage(text, authorName);

      setRemote((prev) =>
        patchReadyForRoom(roomId, prev, (items) => mergeMessageList(items, optimistic)),
      );

      setIsSending(true);
      try {
        const created = await sendRoomMessage(roomId, { message: text });
        const optimisticId = optimistic.id;
        if (created) {
          setRemote((prev) =>
            patchReadyForRoom(roomId, prev, (items) => {
              const next = items.filter((m) => m.id !== optimisticId);
              return mergeMessageList(next, mapMessageDtoToView(created));
            }),
          );
        } else {
          const page = await fetchRoomMessages(roomId);
          setRemote({
            roomId,
            kind: "ready",
            items: page.items.map(mapMessageDtoToView),
          });
        }
      } catch (err: unknown) {
        setRemote((prev) =>
          patchReadyForRoom(roomId, prev, (items) =>
            items.filter((m) => m.id !== optimistic.id),
          ),
        );
        setSendError(parseApiFailure(err, CHAT_ROOM_SEND_MESSAGE_FAILURE));
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [roomId, session.user?.fullName],
  );

  return useMemo(() => {
    const isLoading =
      roomId !== undefined && (!remote || remote.roomId !== roomId);

    let errorMessage: string | null = null;
    let items: ChatRoomMessageView[] = [];
    if (roomId !== undefined && remote !== null && remote.roomId === roomId) {
      if (remote.kind === "error") {
        errorMessage = remote.message;
      } else {
        items = remote.items;
      }
    }

    return {
      items,
      isLoading,
      errorMessage,
      send,
      isSending,
      sendError,
    };
  }, [roomId, remote, send, isSending, sendError]);
}
