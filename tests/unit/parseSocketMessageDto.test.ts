import { describe, expect, it } from "vitest";
import { parseMessageDtoFromSocket } from "../../src/shared/lib/parseSocketMessageDto";

describe("parseMessageDtoFromSocket", () => {
  it("parses valid payload in root shape", () => {
    const parsed = parseMessageDtoFromSocket({
      id: "m1",
      roomId: "r1",
      senderId: "u1",
      message: "hello",
      createdAt: "2025-01-01T00:00:00.000Z",
      sender: { id: "u1", fullName: "User 1", avatarUrl: null },
      clientMessageId: "cid-1",
    });

    expect(parsed).toMatchObject({
      id: "m1",
      roomId: "r1",
      senderId: "u1",
      message: "hello",
      clientMessageId: "cid-1",
    });
  });

  it("parses nested payload and fallback text field", () => {
    const parsed = parseMessageDtoFromSocket({
      payload: {
        id: 10,
        roomId: 20,
        senderId: 30,
        text: "from text",
        createdAt: 1_710_000_000_000,
        sender: { id: 30, name: "Sender Name" },
      },
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.id).toBe("10");
    expect(parsed?.message).toBe("from text");
  });

  it("returns null when mandatory fields are missing", () => {
    const parsed = parseMessageDtoFromSocket({ roomId: "r1", message: "x" });
    expect(parsed).toBeNull();
  });
});
