import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../src/shared/api/error";
import { useChatPage } from "../../src/pages/chat/model/useChatPage";

const fetchRoomByIdMock = vi.fn();
const navigateMock = vi.fn();
let chatIdParam: string | undefined;

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ chatId: chatIdParam }),
}));

vi.mock("../../src/shared/api", () => ({
  ApiError,
  fetchRoomById: (...args: unknown[]) => fetchRoomByIdMock(...args),
  parseApiFailure: () => "failed to load",
}));

vi.mock("../../src/shared/lib/chatSocket", () => ({
  getOrCreateChatSocket: () => null,
}));

describe("useChatPage", () => {
  beforeEach(() => {
    fetchRoomByIdMock.mockReset();
    navigateMock.mockReset();
  });

  it("redirects invalid chat id to /chat", async () => {
    chatIdParam = "invalid-id";
    renderHook(() => useChatPage());
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/chat", { replace: true }));
  });

  it("redirects to /chat when room is not found", async () => {
    chatIdParam = "11111111-1111-4111-8111-111111111111";
    fetchRoomByIdMock.mockRejectedValue(new ApiError(404, "not found"));
    renderHook(() => useChatPage());
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/chat", { replace: true }));
  });

  it("returns ready state when room is loaded", async () => {
    chatIdParam = "11111111-1111-4111-8111-111111111111";
    fetchRoomByIdMock.mockResolvedValue({
      id: chatIdParam,
      displayTitle: "Room",
      name: "Room",
      type: "group",
      updatedAt: "2025-01-01T00:00:00.000Z",
      avatarUrls: [],
    });

    const { result } = renderHook(() => useChatPage());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") {
      throw new Error("Expected ready state");
    }
    expect(result.current.viewModel.activeConversation.id).toBe(chatIdParam);
  });
});
