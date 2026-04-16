import type { ChatRoomMessageView } from "../../../entities/chat";

export type MessagesPaginationState = {
  total: number;
  oldestLoadedOffset: number;
};

export type RemoteMessages =
  | { roomId: string; kind: "ready"; items: ChatRoomMessageView[]; pagination: MessagesPaginationState }
  | { roomId: string; kind: "error"; message: string };

export function patchReadyForRoom(
  roomId: string,
  prev: RemoteMessages | null,
  update: (items: ChatRoomMessageView[]) => ChatRoomMessageView[],
): RemoteMessages | null {
  if (!prev || prev.roomId !== roomId || prev.kind !== "ready") {
    return prev;
  }
  return {
    roomId,
    kind: "ready",
    items: update(prev.items),
    pagination: prev.pagination,
  };
}
