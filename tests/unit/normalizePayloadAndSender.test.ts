import { describe, expect, it } from "vitest";
import {
  normalizeMessagePayload,
  toIsoString,
  toStringId,
} from "../../src/shared/lib/normalizeMessagePayload";
import { normalizeSender } from "../../src/shared/lib/normalizeSender";

describe("normalizeMessagePayload", () => {
  it("reads nested payload.message object", () => {
    const result = normalizeMessagePayload({ message: { roomId: "r1", text: "hello" } });
    expect(result).toEqual({ roomId: "r1", text: "hello" });
  });

  it("returns root object when no nested wrapper found", () => {
    const result = normalizeMessagePayload({ roomId: "r1", senderId: "u1" });
    expect(result).toEqual({ roomId: "r1", senderId: "u1" });
  });

  it("normalizes ids and dates", () => {
    expect(toStringId(123)).toBe("123");
    expect(toIsoString(1_710_000_000_000)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("normalizeSender", () => {
  it("uses sender object when full shape is provided", () => {
    const result = normalizeSender({
      sender: { id: "u1", fullName: "John", avatarUrl: "x.png" },
    });
    expect(result).toEqual({ id: "u1", fullName: "John", avatarUrl: "x.png" });
  });

  it("supports sender.name fallback in sender object", () => {
    const result = normalizeSender({ sender: { id: 99, name: "Kate", avatarUrl: null } });
    expect(result).toEqual({ id: "99", fullName: "Kate", avatarUrl: null });
  });

});
