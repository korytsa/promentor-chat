import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { markRoomRead } from "../../../shared/api";
import type { ChatRoomMessageView } from "../../../entities/chat";
import { latestServerMessageId } from "../../../entities/chat/model/mapMessageDto";
import { CHAT_READ_SCROLL_BOTTOM_PX, CHAT_READ_SCROLL_DEBOUNCE_MS } from "./constants";
import type { RemoteMessages } from "./remoteMessagesPatch";

type UseChatReadReceiptsParams = {
  roomId: string | undefined;
  remote: RemoteMessages | null;
  messagesScrollRef?: RefObject<HTMLDivElement | null>;
  itemsRef: RefObject<ChatRoomMessageView[]>;
};

export function useChatReadReceipts({
  roomId,
  remote,
  messagesScrollRef,
  itemsRef,
}: UseChatReadReceiptsParams) {
  const lastMarkedReadMessageIdRef = useRef<string | null>(null);
  const readReceiptScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lastMarkedReadMessageIdRef.current = null;
  }, [roomId]);

  useEffect(() => {
    return () => {
      if (readReceiptScrollTimerRef.current) {
        clearTimeout(readReceiptScrollTimerRef.current);
      }
    };
  }, []);

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
  }, [roomId, messagesScrollRef, itemsRef]);

  return { onMessagesScrollForReadReceipt };
}
