import type { MessageDto } from "../../../shared/api/types/message";
import { formatMessageTime } from "../../../shared/lib/formatMessageTime";
import type { ChatRoomMessageView } from "./types";

export const OPTIMISTIC_MESSAGE_ID_PREFIX = "optimistic:";

export function mapMessageDtoToView(dto: MessageDto): ChatRoomMessageView {
  return {
    id: dto.id,
    createdAt: dto.createdAt,
    text: dto.message,
    timeLabel: formatMessageTime(dto.createdAt),
    authorName: dto.sender.fullName,
    avatarUrl: dto.sender.avatarUrl ?? undefined,
    isOwn: dto.isOwn,
  };
}

export function buildOptimisticOwnMessage(
  text: string,
  authorName: string,
): ChatRoomMessageView {
  const createdAt = new Date().toISOString();
  return {
    id: `${OPTIMISTIC_MESSAGE_ID_PREFIX}${crypto.randomUUID()}`,
    createdAt,
    text,
    timeLabel: formatMessageTime(createdAt),
    authorName,
    isOwn: true,
    pending: true,
  };
}

export function latestServerMessageId(
  items: readonly ChatRoomMessageView[],
): string | undefined {
  for (let i = items.length - 1; i >= 0; i--) {
    const m = items[i];
    if (m.pending || m.id.startsWith(OPTIMISTIC_MESSAGE_ID_PREFIX)) {
      continue;
    }
    return m.id;
  }
  return undefined;
}

export function sortMessagesByCreatedAt(
  items: readonly ChatRoomMessageView[],
): ChatRoomMessageView[] {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function mergeMessageList(
  items: ChatRoomMessageView[],
  next: ChatRoomMessageView,
): ChatRoomMessageView[] {
  if (items.some((m) => m.id === next.id)) {
    return items;
  }
  return sortMessagesByCreatedAt([...items, next]);
}

export function mergePrependedMessages(
  existing: ChatRoomMessageView[],
  older: ChatRoomMessageView[],
): ChatRoomMessageView[] {
  const byId = new Map<string, ChatRoomMessageView>();
  for (const m of older) {
    byId.set(m.id, m);
  }
  for (const m of existing) {
    byId.set(m.id, m);
  }
  return sortMessagesByCreatedAt([...byId.values()]);
}
