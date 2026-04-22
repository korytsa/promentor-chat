import { useCallback } from "react";
import type { RefObject } from "react";
import { useHostAuthSession } from "../../../features/auth";
import type { ChatRoomMessageView } from "../../../entities/chat";
import { useMessagePagination } from "./useMessagePagination";
import { useMessageSend } from "./useMessageSend";
import { useChatReadReceipts } from "./useChatReadReceipts";
import { useChatRoomSocket } from "./useChatRoomSocket";

export function useChatRoomMessages(
  roomId: string | undefined,
  messagesScrollRef?: RefObject<HTMLDivElement | null>,
) {
  const { session } = useHostAuthSession();
  const isNearBottom = useCallback(() => {
    const el = messagesScrollRef?.current;
    if (!el) {
      return true;
    }
    const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    return distanceToBottom <= 96;
  }, [messagesScrollRef]);

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
    run();
    requestAnimationFrame(() => {
      run();
      requestAnimationFrame(run);
    });
  }, [messagesScrollRef]);

  const {
    remote,
    setRemote,
    patchReadyItems,
    applyIncomingDto,
    loadOlder,
    loadingOlder,
    loadOlderError,
    itemsRef,
  } = useMessagePagination({
    roomId,
    sessionUserId: session.user?.id,
    messagesScrollRef,
  });

  const onIncomingDto = useCallback(
    (dto: Parameters<typeof applyIncomingDto>[0]) => {
      const shouldAutoScroll = dto.senderId === session.user?.id || isNearBottom();
      applyIncomingDto(dto);
      if (shouldAutoScroll) {
        scrollToLatestMessage();
      }
    },
    [applyIncomingDto, isNearBottom, scrollToLatestMessage, session.user?.id],
  );

  const {
    socketConnectionError,
    socketRoomError,
    othersTyping,
    presenceOnlineCount,
    notifyTypingActivity,
    sendMessageViaSocket,
  } = useChatRoomSocket({ roomId, onIncomingDto });

  const readReceipts = useChatReadReceipts({
    roomId,
    remote,
    messagesScrollRef,
    itemsRef,
  });
  const onMessagesScrollForReadReceipt = readReceipts.onMessagesScrollForReadReceipt;

  const { send, isSending, sendError } = useMessageSend({
    roomId,
    sessionFullName: session.user?.fullName,
    patchReadyItems,
    scrollToLatestMessage,
    sendMessageViaSocket,
    setRemote,
  });

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
