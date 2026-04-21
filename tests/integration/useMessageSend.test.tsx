import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMessageSend } from "../../src/pages/chat/model/useMessageSend";

const sendRoomMessageMock = vi.fn();
const markRoomReadMock = vi.fn();
const parseApiFailureMock = vi.fn(() => "send failed");
const loadInitialRoomMessagesMock = vi.fn();

vi.mock("../../src/shared/api", () => ({
  sendRoomMessage: (...args: unknown[]) => sendRoomMessageMock(...args),
  markRoomRead: (...args: unknown[]) => markRoomReadMock(...args),
  parseApiFailure: (...args: unknown[]) => parseApiFailureMock(...args),
}));

vi.mock("../../src/pages/chat/model/chatRoomMessageUtils", () => ({
  loadInitialRoomMessages: (...args: unknown[]) => loadInitialRoomMessagesMock(...args),
}));

describe("useMessageSend", () => {
  beforeEach(() => {
    sendRoomMessageMock.mockReset();
    markRoomReadMock.mockReset();
    markRoomReadMock.mockResolvedValue(undefined);
    parseApiFailureMock.mockClear();
    loadInitialRoomMessagesMock.mockReset();
  });

  it("uses REST fallback and marks read when socket send fails", async () => {
    const patchReadyItems = vi.fn();
    sendRoomMessageMock.mockResolvedValue({
      id: "m1",
      roomId: "room-1",
      senderId: "u1",
      message: "hello",
      createdAt: "2025-01-01T00:00:00.000Z",
      sender: { id: "u1", fullName: "You", avatarUrl: null },
      isOwn: true,
    });

    const { result } = renderHook(() =>
      useMessageSend({
        roomId: "room-1",
        sessionFullName: "You",
        patchReadyItems,
        scrollToLatestMessage: vi.fn(),
        sendMessageViaSocket: vi.fn().mockResolvedValue(false),
        setRemote: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.send("hello");
    });

    expect(sendRoomMessageMock).toHaveBeenCalledTimes(1);
    expect(markRoomReadMock).toHaveBeenCalledWith("room-1", { messageId: "m1" });
  });

  it("sets send error and rethrows when sending fails", async () => {
    const patchReadyItems = vi.fn();
    sendRoomMessageMock.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() =>
      useMessageSend({
        roomId: "room-1",
        sessionFullName: "You",
        patchReadyItems,
        scrollToLatestMessage: vi.fn(),
        sendMessageViaSocket: vi.fn().mockResolvedValue(false),
        setRemote: vi.fn(),
      }),
    );

    await expect(result.current.send("hello")).rejects.toThrow("boom");
    await waitFor(() => expect(result.current.sendError).toBe("send failed"));
  });
});
