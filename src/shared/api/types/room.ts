export type ChatRoomTypeResponse = "private" | "group";

export type RoomListItemDto = {
  id: string;
  name?: string | null;
  displayTitle?: string | null;
  type: ChatRoomTypeResponse;
  updatedAt: string;
  membersCount?: number;
  avatarUrls?: string[];
  lastMessage?: unknown;
  unreadCount?: number;
};

export type RoomDetailDto = RoomListItemDto & {
  members?: Array<{ userId: string; fullName: string; avatarUrl?: string | null }>;
  membersOnlineCount?: number;
  createdBy?: string;
};

export type CreateRoomDto =
  | { type: "private"; memberIds: [string] }
  | { type: "group"; name: string; memberIds: string[] };
