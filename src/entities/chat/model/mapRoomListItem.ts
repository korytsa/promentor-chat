import { formatConversationUpdatedAt } from "../../../shared/lib/formatConversationUpdatedAt";
import type { RoomListItemDto } from "../../../shared/api/types/room";
import type { Conversation } from "./types";

export function mapRoomListItemToConversation(dto: RoomListItemDto): Conversation {
  const title =
    (typeof dto.displayTitle === "string" && dto.displayTitle.trim()) ||
    (typeof dto.name === "string" && dto.name.trim()) ||
    "Chat";

  return {
    id: dto.id,
    title,
    updatedAt: formatConversationUpdatedAt(dto.updatedAt),
    category: dto.type === "group" ? "group" : "direct",
    avatarUrls: Array.isArray(dto.avatarUrls) ? dto.avatarUrls.filter(Boolean) : [],
  };
}

export function sortRoomsByUpdatedAtDesc(items: RoomListItemDto[]): RoomListItemDto[] {
  return [...items].sort((a, b) => {
    const ta = new Date(a.updatedAt).getTime();
    const tb = new Date(b.updatedAt).getTime();
    const aInvalid = Number.isNaN(ta);
    const bInvalid = Number.isNaN(tb);
    if (aInvalid && bInvalid) {
      return 0;
    }
    if (aInvalid) {
      return 1;
    }
    if (bInvalid) {
      return -1;
    }
    return tb - ta;
  });
}
