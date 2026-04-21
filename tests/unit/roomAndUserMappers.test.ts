import { describe, expect, it } from "vitest";
import {
  mapRoomListItemToConversation,
  sortRoomsByUpdatedAtDesc,
} from "../../src/entities/chat/model/mapRoomListItem";
import {
  mapUserSearchDtoToChatOption,
  mapUserSearchDtoToSearchUser,
} from "../../src/entities/chat/model/mapUserSearchDto";

describe("mapRoomListItemToConversation", () => {
  it("prefers displayTitle, maps type and filters empty avatars", () => {
    const result = mapRoomListItemToConversation({
      id: "r1",
      name: "Fallback",
      displayTitle: "Visible title",
      type: "group",
      updatedAt: "2025-01-01T00:00:00.000Z",
      avatarUrls: ["a.png", "", null as unknown as string],
    });

    expect(result.title).toBe("Visible title");
    expect(result.category).toBe("group");
    expect(result.avatarUrls).toEqual(["a.png"]);
  });

  it("sorts rooms by updatedAt descending with invalid dates at end", () => {
    const sorted = sortRoomsByUpdatedAtDesc([
      { id: "a", updatedAt: "bad-date" } as never,
      { id: "b", updatedAt: "2025-01-02T00:00:00.000Z" } as never,
      { id: "c", updatedAt: "2025-01-01T00:00:00.000Z" } as never,
    ]);
    expect(sorted.map((x) => x.id)).toEqual(["b", "c", "a"]);
  });
});

describe("mapUserSearchDto mappers", () => {
  it("maps search user dto to SearchUser and ChatOption", () => {
    const dto = { id: "u2", fullName: "Kate", avatarUrl: null };
    expect(mapUserSearchDtoToSearchUser(dto)).toEqual({ id: "u2", name: "Kate", avatarUrl: "" });
    expect(mapUserSearchDtoToChatOption(dto)).toEqual({
      id: "u2",
      name: "Kate",
      avatarUrl: "",
      isUserOnly: true,
    });
  });
});
