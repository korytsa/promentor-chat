import { describe, expect, it } from "vitest";
import type { ChatSearchOption, Conversation } from "../../src/entities/chat";
import {
  isSamePersonAsDirectRoom,
  partitionConversations,
  toSearchOptions,
  withoutRemoteDuplicatesAgainstDirectRooms,
} from "../../src/widgets/chat-sidebar/model/sidebarSearchUtils";

describe("sidebarSearchUtils", () => {
  it("partitions direct and group conversations", () => {
    const input: Conversation[] = [
      { id: "1", title: "A", updatedAt: "x", category: "direct", avatarUrls: [] },
      { id: "2", title: "B", updatedAt: "x", category: "group", avatarUrls: [] },
    ];

    const result = partitionConversations(input);

    expect(result.directMessages).toHaveLength(1);
    expect(result.groupMessages).toHaveLength(1);
    expect(result.directMessages[0]?.id).toBe("1");
    expect(result.groupMessages[0]?.id).toBe("2");
  });

  it("maps conversations to search options", () => {
    const result = toSearchOptions([
      { id: "1", title: "Room", updatedAt: "x", category: "direct", avatarUrls: ["a.png"] },
    ]);

    expect(result).toEqual([
      { id: "1", name: "Room", avatarUrl: "a.png", conversationCategory: "direct" },
    ]);
  });

  it("checks duplicate user by normalized name and avatar", () => {
    const local: ChatSearchOption = {
      id: "local",
      name: "  John DOE ",
      avatarUrl: "a.png",
      conversationCategory: "direct",
    };
    const remote: ChatSearchOption = {
      id: "u1",
      name: "john doe",
      avatarUrl: "a.png",
      isUserOnly: true,
    };

    expect(isSamePersonAsDirectRoom(local, remote)).toBe(true);
  });

  it("filters out remotes already represented by direct rooms", () => {
    const remotes: ChatSearchOption[] = [
      { id: "u1", name: "John", avatarUrl: "a.png", isUserOnly: true },
      { id: "u2", name: "Kate", avatarUrl: "k.png", isUserOnly: true },
    ];
    const locals: ChatSearchOption[] = [
      { id: "r1", name: "John", avatarUrl: "a.png", conversationCategory: "direct" },
    ];

    const result = withoutRemoteDuplicatesAgainstDirectRooms(remotes, locals);

    expect(result).toEqual([{ id: "u2", name: "Kate", avatarUrl: "k.png", isUserOnly: true }]);
  });
});
