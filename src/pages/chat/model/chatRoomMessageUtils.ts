import type { MessageDto } from "../../../shared/api/types/message";
import { mapMessageDtoToView, mergeMessageList } from "../../../entities/chat/model/mapMessageDto";
import type { MessagesPaginationState, RemoteMessages } from "./remoteMessagesPatch";

export function buildPaginationFromPage(page: {
  total: number;
  offset: number;
  items: unknown[];
}): MessagesPaginationState {
  return {
    total: page.total,
    nextOffset: page.offset + page.items.length,
  };
}

type ReadyRemote = Extract<RemoteMessages, { kind: "ready" }>;

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
      nextOffset: prev.pagination.nextOffset,
    },
  };
}
