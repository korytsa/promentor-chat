import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import type { MessageDto } from "../../../shared/api/types/message";
import { useHostAuthSession } from "../../../features/auth";
import { getOrCreateChatSocket } from "../../../shared/lib/chatSocket";
import { CHAT_SOCKET_EVENTS } from "../../../shared/lib/chatSocketEvents";
import { parseMessageDtoFromSocket } from "../../../shared/lib/parseSocketMessageDto";
import {
  parseChatRoomPresencePayload,
  parseChatTypingPayload,
} from "../../../shared/lib/chatSocketPayloads";
import { readSocketErrorMessage } from "../../../shared/lib/socketPayloadHelpers";
import { CHAT_TYPING_IDLE_MS } from "./constants";

type UseChatRoomSocketParams = {
  roomId: string | undefined;
  onIncomingDto: (dto: MessageDto) => void;
};

export function useChatRoomSocket({ roomId, onIncomingDto }: UseChatRoomSocketParams) {
  const { session } = useHostAuthSession();
  const [socketConnectionError, setSocketConnectionError] = useState<string | null>(null);
  const [socketRoomError, setSocketRoomError] = useState<string | null>(null);
  const [typingRemoteUserIds, setTypingRemoteUserIds] = useState<string[]>([]);
  const [presenceOnlineCount, setPresenceOnlineCount] = useState<number | null>(null);

  const roomIdRef = useRef(roomId);
  const selfUserIdRef = useRef<string | undefined>(undefined);
  const onIncomingRef = useRef(onIncomingDto);
  const typingIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    selfUserIdRef.current = session.user?.id;
  }, [session.user?.id]);

  useEffect(() => {
    onIncomingRef.current = onIncomingDto;
  }, [onIncomingDto]);

  useEffect(() => {
    startTransition(() => {
      setSocketRoomError(null);
      setSocketConnectionError(null);
      setTypingRemoteUserIds([]);
      setPresenceOnlineCount(null);
    });

    const socket = getOrCreateChatSocket();
    if (!socket || !roomId) {
      return;
    }

    const joinActiveRoom = () => {
      const id = roomIdRef.current;
      if (id && socket.connected) {
        socket.emit(CHAT_SOCKET_EVENTS.join, { roomId: id });
      }
    };

    const onConnectError = (err: Error) => {
      setSocketConnectionError(err.message || "Could not connect to chat.");
    };

    const onConnect = () => {
      setSocketConnectionError(null);
      joinActiveRoom();
    };

    const onNewMessage = (raw: unknown) => {
      const dto = parseMessageDtoFromSocket(raw);
      if (!dto || dto.roomId !== roomIdRef.current) {
        return;
      }
      onIncomingRef.current(dto);
    };

    const onChatError = (raw: unknown) => {
      setSocketRoomError(readSocketErrorMessage(raw, "Chat error."));
    };

    const onTyping = (raw: unknown) => {
      const parsed = parseChatTypingPayload(raw, roomIdRef.current);
      if (!parsed || parsed.userId === selfUserIdRef.current) {
        return;
      }
      const { userId, typing } = parsed;
      setTypingRemoteUserIds((prev) => {
        if (typing) {
          return prev.includes(userId) ? prev : [...prev, userId];
        }
        return prev.filter((id) => id !== userId);
      });
    };

    const onRoomPresence = (raw: unknown) => {
      const n = parseChatRoomPresencePayload(raw, roomIdRef.current);
      if (n !== null) {
        setPresenceOnlineCount(n);
      }
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on(CHAT_SOCKET_EVENTS.newMessage, onNewMessage);
    socket.on(CHAT_SOCKET_EVENTS.error, onChatError);
    socket.on(CHAT_SOCKET_EVENTS.typing, onTyping);
    socket.on(CHAT_SOCKET_EVENTS.roomPresence, onRoomPresence);

    if (socket.connected) {
      joinActiveRoom();
    }

    return () => {
      socket.emit(CHAT_SOCKET_EVENTS.leave, { roomId });
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off(CHAT_SOCKET_EVENTS.newMessage, onNewMessage);
      socket.off(CHAT_SOCKET_EVENTS.error, onChatError);
      socket.off(CHAT_SOCKET_EVENTS.typing, onTyping);
      socket.off(CHAT_SOCKET_EVENTS.roomPresence, onRoomPresence);
    };
  }, [roomId]);

  const notifyTypingActivity = useCallback(() => {
    const socket = getOrCreateChatSocket();
    if (!socket?.connected || !roomId) {
      return;
    }
    socket.emit(CHAT_SOCKET_EVENTS.typing, { roomId, typing: true });
    if (typingIdleTimerRef.current) {
      clearTimeout(typingIdleTimerRef.current);
    }
    typingIdleTimerRef.current = setTimeout(() => {
      socket.emit(CHAT_SOCKET_EVENTS.typing, { roomId, typing: false });
      typingIdleTimerRef.current = null;
    }, CHAT_TYPING_IDLE_MS);
  }, [roomId]);

  const sendMessageViaSocket = useCallback(
    async (message: string, clientMessageId?: string): Promise<boolean> => {
      if (!roomId) {
        return false;
      }
      const socket = getOrCreateChatSocket();
      if (!socket?.connected) {
        throw new Error("Socket is not connected.");
      }
      socket.emit(CHAT_SOCKET_EVENTS.sendMessage, { roomId, message, clientMessageId });
      return true;
    },
    [roomId],
  );

  useEffect(() => {
    return () => {
      if (typingIdleTimerRef.current) {
        clearTimeout(typingIdleTimerRef.current);
      }
    };
  }, []);

  const othersTyping = typingRemoteUserIds.length > 0;

  return {
    socketConnectionError,
    socketRoomError,
    othersTyping,
    presenceOnlineCount,
    notifyTypingActivity,
    sendMessageViaSocket,
  };
}
