import { describe, expect, it } from "vitest";
import { appendIncomingDto, mergeInitialWithBufferedIncoming } from "../../src/pages/chat/model/chatRoomMessageUtils";
import { patchReadyForRoom } from "../../src/pages/chat/model/remoteMessagesPatch";
import { OPTIMISTIC_MESSAGE_ID_PREFIX } from "../../src/entities/chat/model/mapMessageDto";

describe("chatRoomMessageUtils", () => {
  it("replaces optimistic own message by clientMessageId on incoming own dto", () => {
    const prev = {
      roomId: "room-1",
      kind: "ready" as const,
      items: [
        {
          id: `${OPTIMISTIC_MESSAGE_ID_PREFIX}cid-1`,
          createdAt: "2025-01-01T00:00:00.000Z",
          text: "hello",
          timeLabel: "00:00",
          authorName: "You",
          isOwn: true,
          pending: true,
          clientMessageId: "cid-1",
        },
      ],
      pagination: { total: 1, oldestLoadedOffset: 0 },
    };

    const next = appendIncomingDto(prev, {
      id: "m-1",
      roomId: "room-1",
      senderId: "u-1",
      message: "hello",
      createdAt: "2025-01-01T00:00:01.000Z",
      sender: { id: "u-1", fullName: "You", avatarUrl: null },
      isOwn: true,
      clientMessageId: "cid-1",
    });

    expect(next.items).toHaveLength(1);
    expect(next.items[0]?.id).toBe("m-1");
  });

  it("merges buffered incoming with initial items and deduplicates", () => {
    const initialItems = [
      {
        id: "m-1",
        createdAt: "2025-01-01T00:00:01.000Z",
        text: "first",
        timeLabel: "00:01",
        authorName: "A",
        isOwn: false,
      },
    ];
    const merged = mergeInitialWithBufferedIncoming(
      "room-1",
      initialItems,
      { total: 1, oldestLoadedOffset: 0 },
      [
        {
          id: "m-1",
          roomId: "room-1",
          senderId: "u-1",
          message: "first",
          createdAt: "2025-01-01T00:00:01.000Z",
          sender: { id: "u-1", fullName: "A", avatarUrl: null },
          isOwn: false,
        },
        {
          id: "m-2",
          roomId: "room-1",
          senderId: "u-2",
          message: "second",
          createdAt: "2025-01-01T00:00:02.000Z",
          sender: { id: "u-2", fullName: "B", avatarUrl: null },
          isOwn: false,
        },
      ],
      "u-1",
    );

    expect(merged.map((m) => m.id)).toEqual(["m-1", "m-2"]);
  });
});

describe("remoteMessagesPatch", () => {
  it("updates items only for matching ready room", () => {
    const updated = patchReadyForRoom(
      "room-1",
      {
        roomId: "room-1",
        kind: "ready",
        items: [],
        pagination: { total: 0, oldestLoadedOffset: 0 },
      },
      (items) => [...items, { id: "m1", createdAt: "", text: "", timeLabel: "", authorName: "", isOwn: false }],
    );
    expect(updated?.kind).toBe("ready");
    if (updated?.kind !== "ready") {
      throw new Error("Expected ready state");
    }
    expect(updated.items).toHaveLength(1);
  });
});
