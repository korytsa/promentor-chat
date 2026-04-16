import type { MessageDto, MessagesPageDto } from "../../../shared/api/types/message";
import { fetchRoomMessages } from "../../../shared/api";
import type { ChatRoomMessageView } from "../../../entities/chat";
import {
  mapMessageDtoToView,
  mergeMessageList,
  mergePrependedMessages,
} from "../../../entities/chat/model/mapMessageDto";
import { CHAT_MESSAGE_PAGE_SIZE } from "./constants";
import type { MessagesPaginationState, RemoteMessages } from "./remoteMessagesPatch";

type ReadyRemote = Extract<RemoteMessages, { kind: "ready" }>;

export async function loadInitialRoomMessages(roomId: string): Promise<{
  items: ChatRoomMessageView[];
  pagination: MessagesPaginationState;
}> {
  const first = await fetchRoomMessages(roomId, { limit: CHAT_MESSAGE_PAGE_SIZE, offset: 0 });
  if (first.total <= CHAT_MESSAGE_PAGE_SIZE) {
    return {
      items: first.items.map(mapMessageDtoToView),
      pagination: { total: first.total, oldestLoadedOffset: first.offset },
    };
  }
  const start = Math.max(0, first.total - CHAT_MESSAGE_PAGE_SIZE);
  const page = await fetchRoomMessages(roomId, { limit: CHAT_MESSAGE_PAGE_SIZE, offset: start });
  return {
    items: page.items.map(mapMessageDtoToView),
    pagination: { total: page.total, oldestLoadedOffset: page.offset },
  };
}

export function mergeOlderMessagesPage(
  prev: ReadyRemote,
  roomId: string,
  page: MessagesPageDto,
): ReadyRemote {
  const newViews = page.items.map(mapMessageDtoToView);
  return {
    roomId,
    kind: "ready",
    items: mergePrependedMessages(prev.items, newViews),
    pagination: {
      total: page.total,
      oldestLoadedOffset: page.offset,
    },
  };
}

export function appendIncomingDto(prev: ReadyRemote, dto: MessageDto): ReadyRemote {
  const next = mapMessageDtoToView(dto);
  const beforeLen = prev.items.length;
  const merged = mergeMessageList(prev.items, next);
  if (merged.length === beforeLen) {
    return prev;
  }
  return {
    roomId: prev.roomId,
    kind: "ready",
    items: merged,
    pagination: {
      total: prev.pagination.total + 1,
      oldestLoadedOffset: prev.pagination.oldestLoadedOffset,
    },
  };
}
