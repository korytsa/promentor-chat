import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  fetchRoomMessages,
  markRoomRead,
  parseApiFailure,
  sendRoomMessage,
} from "../../../shared/api";
import type { MessageDto } from "../../../shared/api/types/message";
import { useHostAuthSession } from "../../../features/auth";
import type { ChatRoomMessageView } from "../../../entities/chat";
import {
  buildOptimisticOwnMessage,
  latestServerMessageId,
  mapMessageDtoToView,
  mergeMessageList,
} from "../../../entities/chat/model/mapMessageDto";
import {
  CHAT_MESSAGE_PAGE_SIZE,
  CHAT_READ_SCROLL_BOTTOM_PX,
  CHAT_READ_SCROLL_DEBOUNCE_MS,
  CHAT_ROOM_LOAD_MESSAGES_FAILURE,
  CHAT_ROOM_LOAD_OLDER_FAILURE,
  CHAT_ROOM_SEND_MESSAGE_FAILURE,
} from "./constants";
import { appendIncomingDto, loadInitialRoomMessages, mergeOlderMessagesPage } from "./chatRoomMessageUtils";
import { patchReadyForRoom, type MessagesPaginationState, type RemoteMessages } from "./remoteMessagesPatch";
import { useChatRoomSocket } from "./useChatRoomSocket";

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

  const scrollToLatestMessage = useCallback(() => {
    if (!messagesScrollRef?.current) {
      return;
    }
    const run = () => {
      const el = messagesScrollRef.current;
      if (!el) {
        return;
      }
      el.scrollTop = el.scrollHeight;
    };
    // Run a few times across frames to avoid render/measure races.
    run();
    requestAnimationFrame(() => {
      run();
      requestAnimationFrame(run);
    });
  }, [messagesScrollRef]);

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

  const lastMarkedReadMessageIdRef = useRef<string | null>(null);
  const readReceiptScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsRef = useRef<ChatRoomMessageView[]>([]);
  const bufferedIncomingRef = useRef<MessageDto[]>([]);

  useEffect(() => {
    lastMarkedReadMessageIdRef.current = null;
    bufferedIncomingRef.current = [];
  }, [roomId]);

  useEffect(() => {
    return () => {
      if (readReceiptScrollTimerRef.current) {
        clearTimeout(readReceiptScrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (roomId !== undefined && remote !== null && remote.roomId === roomId && remote.kind === "ready") {
      itemsRef.current = remote.items;
    } else {
      itemsRef.current = [];
    }
  }, [roomId, remote]);

  const onIncomingDto = useCallback(
    (dto: MessageDto) => {
      const resolved: MessageDto = {
        ...dto,
        isOwn: dto.senderId === session.user?.id,
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
      scrollToLatestMessage();
    },
    [roomId, session.user?.id, scrollToLatestMessage],
  );

  const {
    socketConnectionError,
    socketRoomError,
    othersTyping,
    presenceOnlineCount,
    notifyTypingActivity,
    sendMessageViaSocket,
  } = useChatRoomSocket({ roomId, onIncomingDto });

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
        let mergedItems = items;
        mergedItems =
          bufferedForRoom.length > 0
            ? bufferedForRoom.reduce<ChatRoomMessageView[]>(
                (acc, dto) =>
                  appendIncomingDto(
                    {
                      roomId,
                      kind: "ready",
                      items: acc,
                      pagination: { total: pagination.total, oldestLoadedOffset: pagination.oldestLoadedOffset },
                    },
                    {
                      ...dto,
                      isOwn: dto.senderId === session.user?.id,
                    },
                  ).items,
                mergedItems,
              )
            : mergedItems;
        setRemote({
          roomId,
          kind: "ready",
          items: mergedItems,
          pagination,
        });
        const mid = latestServerMessageId(mergedItems);
        lastMarkedReadMessageIdRef.current = mid ?? null;
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
  }, [roomId, session.user?.id]);

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
      pendingScrollRestoreRef.current = {
        scrollHeight: el.scrollHeight,
        scrollTop: el.scrollTop,
      };
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

  const readReceiptFingerprint =
    remote?.kind === "ready" && roomId !== undefined && remote.roomId === roomId
      ? `${remote.items.length}:${latestServerMessageId(remote.items) ?? ""}`
      : "";

  useLayoutEffect(() => {
    if (!roomId || remote?.kind !== "ready" || remote.roomId !== roomId) {
      return;
    }
    const el = messagesScrollRef?.current;
    if (!el) {
      return;
    }
    const mid = latestServerMessageId(remote.items);
    if (!mid || mid === lastMarkedReadMessageIdRef.current) {
      return;
    }
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (gap > CHAT_READ_SCROLL_BOTTOM_PX) {
      return;
    }
    lastMarkedReadMessageIdRef.current = mid;
    void markRoomRead(roomId, { messageId: mid }).catch(() => {});
  }, [roomId, remote, messagesScrollRef, readReceiptFingerprint]);

  const onMessagesScrollForReadReceipt = useCallback(() => {
    const el = messagesScrollRef?.current;
    if (!el || !roomId) {
      return;
    }
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (gap > CHAT_READ_SCROLL_BOTTOM_PX) {
      return;
    }
    if (readReceiptScrollTimerRef.current) {
      clearTimeout(readReceiptScrollTimerRef.current);
    }
    readReceiptScrollTimerRef.current = setTimeout(() => {
      readReceiptScrollTimerRef.current = null;
      const el2 = messagesScrollRef?.current;
      if (!el2 || !roomId) {
        return;
      }
      const gap2 = el2.scrollHeight - el2.scrollTop - el2.clientHeight;
      if (gap2 > CHAT_READ_SCROLL_BOTTOM_PX) {
        return;
      }
      const mid = latestServerMessageId(itemsRef.current);
      if (!mid || mid === lastMarkedReadMessageIdRef.current) {
        return;
      }
      lastMarkedReadMessageIdRef.current = mid;
      void markRoomRead(roomId, { messageId: mid }).catch(() => {});
    }, CHAT_READ_SCROLL_DEBOUNCE_MS);
  }, [roomId, messagesScrollRef]);

  const send = useCallback(
    async (text: string) => {
      if (!roomId) {
        return;
      }
      setSendError(null);
      const clientMessageId = crypto.randomUUID();
      const authorName = session.user?.fullName?.trim() || "You";
      const optimistic = buildOptimisticOwnMessage(text, authorName, clientMessageId);

      setRemote((prev) =>
        patchReadyForRoom(roomId, prev, (items) => mergeMessageList(items, optimistic)),
      );
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
          setRemote((prev) =>
            patchReadyForRoom(roomId, prev, (items) => {
              const next = items.filter((m) => m.id !== optimisticId);
              return mergeMessageList(next, mapMessageDtoToView(created));
            }),
          );
          lastMarkedReadMessageIdRef.current = created.id;
          void markRoomRead(roomId, { messageId: created.id }).catch(() => {});
        } else {
          const { items, pagination } = await loadInitialRoomMessages(roomId);
          setRemote({
            roomId,
            kind: "ready",
            items,
            pagination,
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
    [roomId, session.user?.fullName, sendMessageViaSocket, scrollToLatestMessage],
  );

  const isLoading = roomId !== undefined && (!remote || remote.roomId !== roomId);

  let errorMessage: string | null = null;
  let items: ChatRoomMessageView[] = [];
  let hasMoreOlder = false;
  if (roomId !== undefined && remote !== null && remote.roomId === roomId) {
    if (remote.kind === "error") {
      errorMessage = remote.message;
    } else {
      items = remote.items;
      hasMoreOlder = remote.pagination.oldestLoadedOffset > 0;
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
    socketConnectionError,
    socketRoomError,
    othersTyping,
    presenceOnlineCount,
    notifyTypingActivity,
    onMessagesScrollForReadReceipt,
  };
}
