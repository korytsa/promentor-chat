import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
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
  mergePrependedMessages,
} from "../../../entities/chat/model/mapMessageDto";
import {
  CHAT_MESSAGE_PAGE_SIZE,
  CHAT_ROOM_LOAD_MESSAGES_FAILURE,
  CHAT_ROOM_LOAD_OLDER_FAILURE,
  CHAT_ROOM_SEND_MESSAGE_FAILURE,
} from "./constants";
import { patchReadyForRoom, type MessagesPaginationState, type RemoteMessages } from "./remoteMessagesPatch";

function buildPaginationFromPage(page: {
  total: number;
  offset: number;
  items: unknown[];
}): MessagesPaginationState {
  return {
    total: page.total,
    nextOffset: page.offset + page.items.length,
  };
}

export function useChatRoomMessages(
  roomId: string | undefined,
  messagesScrollRef?: RefObject<HTMLDivElement | null>,
) {
  const { session } = useHostAuthSession();
  const [remote, setRemote] = useState<RemoteMessages | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!roomId) {
      return;
    }
    let cancelled = false;

    fetchRoomMessages(roomId, { limit: CHAT_MESSAGE_PAGE_SIZE, offset: 0 })
      .then((page) => {
        if (cancelled) {
          return;
        }
        setRemote({
          roomId,
          kind: "ready",
          items: page.items.map(mapMessageDtoToView),
          pagination: buildPaginationFromPage(page),
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

  const loadOlder = useCallback(async () => {
    if (!roomId || loadingOlderRef.current) {
      return;
    }
    const p = paginationRef.current;
    if (!p || p.nextOffset >= p.total) {
      return;
    }

    const el = messagesScrollRef?.current;
    if (el) {
      pendingScrollRestoreRef.current = {
        scrollHeight: el.scrollHeight,
        scrollTop: el.scrollTop,
      };
    }

    setLoadingOlder(true);
    setLoadOlderError(null);
    try {
      const page = await fetchRoomMessages(roomId, {
        limit: CHAT_MESSAGE_PAGE_SIZE,
        offset: p.nextOffset,
      });
      const newViews = page.items.map(mapMessageDtoToView);
      setRemote((prev) => {
        if (!prev || prev.roomId !== roomId || prev.kind !== "ready") {
          return prev;
        }
        const merged = mergePrependedMessages(prev.items, newViews);
        return {
          roomId,
          kind: "ready",
          items: merged,
          pagination: buildPaginationFromPage(page),
        };
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
          const page = await fetchRoomMessages(roomId, {
            limit: CHAT_MESSAGE_PAGE_SIZE,
            offset: 0,
          });
          setRemote({
            roomId,
            kind: "ready",
            items: page.items.map(mapMessageDtoToView),
            pagination: buildPaginationFromPage(page),
          });
        }
      } catch (err: unknown) {
        setRemote((prev) =>
          patchReadyForRoom(roomId, prev, (items) => items.filter((m) => m.id !== optimistic.id)),
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
    let hasMoreOlder = false;
    if (roomId !== undefined && remote !== null && remote.roomId === roomId) {
      if (remote.kind === "error") {
        errorMessage = remote.message;
      } else {
        items = remote.items;
        hasMoreOlder = remote.pagination.nextOffset < remote.pagination.total;
      }
    }

    return {
      items,
      isLoading,
      errorMessage,
      send,
      isSending,
      sendError,
      hasMoreOlder,
      loadingOlder,
      loadOlderError,
      loadOlder,
    };
  }, [roomId, remote, send, isSending, sendError, loadingOlder, loadOlderError, loadOlder]);
}
