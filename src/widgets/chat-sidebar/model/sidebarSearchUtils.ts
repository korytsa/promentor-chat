import type { ChatSearchOption, Conversation } from "../../../entities/chat";

export function partitionConversations(conversations: Conversation[]) {
  const directMessages: Conversation[] = [];
  const groupMessages: Conversation[] = [];
  for (const c of conversations) {
    if (c.category === "direct") {
      directMessages.push(c);
    } else {
      groupMessages.push(c);
    }
  }
  return { directMessages, groupMessages };
}

export function toSearchOptions(conversations: Conversation[]): ChatSearchOption[] {
  return conversations.map((c) => ({
    id: c.id,
    name: c.title,
    avatarUrl: c.avatarUrls[0] ?? "",
    conversationCategory: c.category,
  }));
}

export function isSamePersonAsDirectRoom(
  localRoom: ChatSearchOption,
  remote: ChatSearchOption,
): boolean {
  if (localRoom.conversationCategory !== "direct") {
    return false;
  }
  if (localRoom.name.trim().toLowerCase() !== remote.name.trim().toLowerCase()) {
    return false;
  }
  return (localRoom.avatarUrl ?? "") === (remote.avatarUrl ?? "");
}

export function withoutRemoteDuplicatesAgainstDirectRooms(
  remoteOptions: ChatSearchOption[],
  localRoomOptions: ChatSearchOption[],
): ChatSearchOption[] {
  return remoteOptions.filter(
    (remote) => !localRoomOptions.some((local) => isSamePersonAsDirectRoom(local, remote)),
  );
}
