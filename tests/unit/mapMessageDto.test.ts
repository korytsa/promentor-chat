import { describe, expect, it, vi } from "vitest";
import {
  OPTIMISTIC_MESSAGE_ID_PREFIX,
  buildOptimisticOwnMessage,
  latestServerMessageId,
  mergeMessageList,
  sortMessagesByCreatedAt,
} from "../../src/entities/chat/model/mapMessageDto";

describe("mapMessageDto helpers", () => {
  it("builds optimistic message with clientMessageId-derived id", () => {
    const message = buildOptimisticOwnMessage("hello", "You", "cid-1");
    expect(message.id).toBe(`${OPTIMISTIC_MESSAGE_ID_PREFIX}cid-1`);
    expect(message.pending).toBe(true);
    expect(message.clientMessageId).toBe("cid-1");
  });

  it("builds optimistic message with random uuid without clientMessageId", () => {
    const uuidSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("123e4567-e89b-12d3-a456-426614174000");
    const message = buildOptimisticOwnMessage("hello", "You");
    expect(message.id).toBe(`${OPTIMISTIC_MESSAGE_ID_PREFIX}123e4567-e89b-12d3-a456-426614174000`);
    uuidSpy.mockRestore();
  });

  it("deduplicates by id in mergeMessageList and keeps chronology", () => {
    const merged = mergeMessageList(
      [
        {
          id: "m2",
          createdAt: "2025-01-02T00:00:00.000Z",
          text: "",
          timeLabel: "",
          authorName: "",
          isOwn: false,
        },
      ],
      {
        id: "m1",
        createdAt: "2025-01-01T00:00:00.000Z",
        text: "",
        timeLabel: "",
        authorName: "",
        isOwn: false,
      },
    );
    expect(merged.map((m) => m.id)).toEqual(["m1", "m2"]);
    expect(latestServerMessageId(merged)).toBe("m2");
    expect(sortMessagesByCreatedAt(merged).map((m) => m.id)).toEqual(["m1", "m2"]);
  });
});
