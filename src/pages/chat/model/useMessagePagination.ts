import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { fetchRoomMessages, markRoomRead, parseApiFailure } from "../../../shared/api";
import type { MessageDto } from "../../../shared/api/types/message";
import type { ChatRoomMessageView } from "../../../entities/chat";
import { latestServerMessageId } from "../../../entities/chat/model/mapMessageDto";
import {
  CHAT_MESSAGE_PAGE_SIZE,
  CHAT_ROOM_LOAD_MESSAGES_FAILURE,
  CHAT_ROOM_LOAD_OLDER_FAILURE,
} from "./constants";
import {
  appendIncomingDto,
  loadInitialRoomMessages,
  mergeInitialWithBufferedIncoming,
  mergeOlderMessagesPage,
} from "./chatRoomMessageUtils";
import {
  patchReadyForRoom,
  type MessagesPaginationState,
  type RemoteMessages,
} from "./remoteMessagesPatch";

type Params = {
  roomId: string | undefined;
  sessionUserId: string | undefined;
  messagesScrollRef?: RefObject<HTMLDivElement | null>;
};

export function useMessagePagination({ roomId, sessionUserId, messagesScrollRef }: Params) {
  const [remote, setRemote] = useState<RemoteMessages | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadOlderError, setLoadOlderError] = useState<string | null>(null);

  const paginationRef = useRef<MessagesPaginationState | null>(null);
  useEffect(() => {
    if (remote?.kind === "ready") {
      paginationRef.current = remote.pagination;
    }
  }, [remote]);

  const pendingScrollRestoreRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const prevLoadingOlderRef = useRef(false);
  const loadingOlderRef = useRef(false);
  useEffect(() => {
    loadingOlderRef.current = loadingOlder;
  }, [loadingOlder]);

  const itemsRef = useRef<ChatRoomMessageView[]>([]);
  const bufferedIncomingRef = useRef<MessageDto[]>([]);

  useEffect(() => {
    bufferedIncomingRef.current = [];
  }, [roomId]);

  useEffect(() => {
    if (
      roomId !== undefined &&
      remote !== null &&
      remote.roomId === roomId &&
      remote.kind === "ready"
    ) {
      itemsRef.current = remote.items;
    } else {
      itemsRef.current = [];
    }
  }, [roomId, remote]);

  const patchReadyItems = useCallback(
    (update: (items: ChatRoomMessageView[]) => ChatRoomMessageView[]) => {
      if (!roomId) {
        return;
      }
      setRemote((prev) => patchReadyForRoom(roomId, prev, update));
    },
    [roomId],
  );

  const applyIncomingDto = useCallback(
    (dto: MessageDto) => {
      const resolved: MessageDto = {
        ...dto,
        isOwn: dto.senderId === sessionUserId,
      };
      setRemote((prev) => {
        if (!prev || prev.roomId !== roomId || prev.kind !== "ready") {
          bufferedIncomingRef.current.push(resolved);
          return prev;
        }
        if (dto.roomId !== roomId) {
          return prev;
        }
        return appendIncomingDto(prev, resolved);
      });
    },
    [roomId, sessionUserId],
  );

  useEffect(() => {
    if (!roomId) {
      return;
    }
    let cancelled = false;

    void loadInitialRoomMessages(roomId)
      .then(({ items, pagination }) => {
        if (cancelled) {
          return;
        }
        const bufferedForRoom = bufferedIncomingRef.current.filter((m) => m.roomId === roomId);
        bufferedIncomingRef.current = [];
        const mergedItems = mergeInitialWithBufferedIncoming(
          roomId,
          items,
          pagination,
          bufferedForRoom,
          sessionUserId,
        );
        setRemote({
          roomId,
          kind: "ready",
          items: mergedItems,
          pagination,
        });
        const mid = latestServerMessageId(mergedItems);
        void markRoomRead(roomId, mid ? { messageId: mid } : {}).catch(() => {});
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
  }, [roomId, sessionUserId]);

  const loadOlder = useCallback(async () => {
    if (!roomId || loadingOlderRef.current) {
      return;
    }
    const p = paginationRef.current;
    if (!p || p.oldestLoadedOffset <= 0) {
      return;
    }
    const el = messagesScrollRef?.current;
    if (el) {
      pendingScrollRestoreRef.current = { scrollHeight: el.scrollHeight, scrollTop: el.scrollTop };
    }

    setLoadingOlder(true);
    setLoadOlderError(null);
    const nextOffset = Math.max(0, p.oldestLoadedOffset - CHAT_MESSAGE_PAGE_SIZE);
    try {
      const page = await fetchRoomMessages(roomId, {
        limit: CHAT_MESSAGE_PAGE_SIZE,
        offset: nextOffset,
      });
      setRemote((prev) => {
        if (!prev || prev.roomId !== roomId || prev.kind !== "ready") {
          return prev;
        }
        return mergeOlderMessagesPage(prev, roomId, page);
      });
    } catch (err: unknown) {
      setLoadOlderError(parseApiFailure(err, CHAT_ROOM_LOAD_OLDER_FAILURE));
      pendingScrollRestoreRef.current = null;
    } finally {
      setLoadingOlder(false);
    }
  }, [roomId, messagesScrollRef]);

  useLayoutEffect(() => {
    if (prevLoadingOlderRef.current && !loadingOlder && pendingScrollRestoreRef.current) {
      const pending = pendingScrollRestoreRef.current;
      const el = messagesScrollRef?.current;
      if (el) {
        const delta = el.scrollHeight - pending.scrollHeight;
        el.scrollTop = pending.scrollTop + delta;
      }
      pendingScrollRestoreRef.current = null;
    }
    prevLoadingOlderRef.current = loadingOlder;
  }, [loadingOlder, messagesScrollRef]);

  return {
    remote,
    setRemote,
    patchReadyItems,
    applyIncomingDto,
    loadOlder,
    loadingOlder,
    loadOlderError,
    itemsRef,
  };
}
