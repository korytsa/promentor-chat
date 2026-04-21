import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../src/shared/api/error";
import { useDmOpenOrCreate } from "../../src/widgets/chat-sidebar/model/useDmOpenOrCreate";

const navigateMock = vi.fn();
const createRoomMock = vi.fn();
const fetchRoomsMock = vi.fn();
const parseApiFailureMock = vi.fn(() => "failed");
const invalidateMock = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../../src/shared/api", () => ({
  ApiError,
  createRoom: (...args: unknown[]) => createRoomMock(...args),
  fetchRooms: (...args: unknown[]) => fetchRoomsMock(...args),
  parseApiFailure: (...args: unknown[]) => parseApiFailureMock(...args),
}));

vi.mock("../../src/shared/lib/chatRoomsInvalidate", () => ({
  dispatchChatRoomsInvalidate: () => invalidateMock(),
}));

describe("useDmOpenOrCreate", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    createRoomMock.mockReset();
    fetchRoomsMock.mockReset();
    parseApiFailureMock.mockClear();
    invalidateMock.mockReset();
  });

  it("opens existing non-user option directly", async () => {
    const setDmCreateError = vi.fn();
    const { result } = renderHook(() => useDmOpenOrCreate({ setDmCreateError }));

    await act(async () => {
      const ok = await result.current.onSelectSearchOption({
        id: "room-1",
        name: "Room",
        avatarUrl: "",
        conversationCategory: "group",
      });
      expect(ok).toBe(true);
    });

    expect(navigateMock).toHaveBeenCalledWith("/chat/room-1");
    expect(createRoomMock).not.toHaveBeenCalled();
  });

  it("creates DM and navigates when createRoom succeeds", async () => {
    createRoomMock.mockResolvedValue({ id: "dm-1" });
    const setDmCreateError = vi.fn();
    const { result } = renderHook(() => useDmOpenOrCreate({ setDmCreateError }));

    await act(async () => {
      const ok = await result.current.onSelectSearchOption({
        id: "user-1",
        name: "John",
        avatarUrl: "a.png",
        isUserOnly: true,
      });
      expect(ok).toBe(true);
    });

    expect(invalidateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/chat/dm-1");
  });

  it("falls back to rooms lookup on 400 and opens existing DM", async () => {
    createRoomMock.mockRejectedValue(new ApiError(400, "exists"));
    fetchRoomsMock.mockResolvedValue([
      {
        id: "dm-2",
        displayTitle: "John",
        name: "John",
        type: "private",
        updatedAt: "2025-01-01T00:00:00.000Z",
        avatarUrls: ["a.png"],
      },
    ]);
    const setDmCreateError = vi.fn();
    const { result } = renderHook(() => useDmOpenOrCreate({ setDmCreateError }));

    await act(async () => {
      const ok = await result.current.onSelectSearchOption({
        id: "user-1",
        name: "John",
        avatarUrl: "a.png",
        isUserOnly: true,
      });
      expect(ok).toBe(true);
    });

    expect(fetchRoomsMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/chat/dm-2");
    expect(setDmCreateError).not.toHaveBeenCalled();
  });
});
