export function parseChatTypingPayload(
  raw: unknown,
  activeRoomId: string | undefined,
): { userId: string; typing: boolean } | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.roomId !== "string" || o.roomId !== activeRoomId) {
    return null;
  }
  const userId = typeof o.userId === "string" ? o.userId : null;
  if (!userId) {
    return null;
  }
  const typing = o.typing === true || o.active === true;
  return { userId, typing };
}

export function parseChatRoomPresencePayload(
  raw: unknown,
  activeRoomId: string | undefined,
): number | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.roomId !== "string" || o.roomId !== activeRoomId) {
    return null;
  }
  const n = o.membersOnlineCount ?? o.onlineCount;
  return typeof n === "number" ? n : null;
}
