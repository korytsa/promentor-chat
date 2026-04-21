import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRoomsList } from "../../src/widgets/chat-sidebar/model/useRoomsList";
import { CHAT_ROOMS_INVALIDATE_EVENT } from "../../src/shared/lib/chatRoomsInvalidate";
import { CHAT_SOCKET_EVENTS } from "../../src/shared/lib/chatSocketEvents";
import { server } from "../testServer";

type Listener = (payload?: unknown) => void;
const listeners = new Map<string, Set<Listener>>();

const socketMock = {
  on: vi.fn((event: string, cb: Listener) => {
    const set = listeners.get(event) ?? new Set<Listener>();
    set.add(cb);
    listeners.set(event, set);
  }),
  off: vi.fn((event: string, cb: Listener) => {
    listeners.get(event)?.delete(cb);
  }),
};

vi.mock("../../src/shared/lib/chatSocket", () => ({
  getOrCreateChatSocket: () => socketMock,
}));

describe("useRoomsList", () => {
  beforeEach(() => {
    listeners.clear();
    socketMock.on.mockClear();
    socketMock.off.mockClear();
  });

  it("loads and partitions conversations from API", async () => {
    server.use(
      http.get("http://localhost:3000/rooms", () =>
        HttpResponse.json([
          {
            id: "dm-1",
            displayTitle: "John",
            name: "John",
            type: "private",
            updatedAt: "2025-01-02T00:00:00.000Z",
            avatarUrls: ["a.png"],
          },
          {
            id: "gr-1",
            displayTitle: "Team",
            name: "Team",
            type: "group",
            updatedAt: "2025-01-01T00:00:00.000Z",
            avatarUrls: [],
          },
        ]),
      ),
    );

    const { result } = renderHook(() => useRoomsList());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.directMessages).toHaveLength(1);
    expect(result.current.groupMessages).toHaveLength(1);
  });

  it("refetches when invalidate event is dispatched", async () => {
    let call = 0;
    server.use(
      http.get("http://localhost:3000/rooms", () => {
        call += 1;
        if (call === 1) {
          return HttpResponse.json([]);
        }
        return HttpResponse.json([
          {
            id: "dm-2",
            displayTitle: "Kate",
            name: "Kate",
            type: "private",
            updatedAt: "2025-01-03T00:00:00.000Z",
            avatarUrls: [],
          },
        ]);
      }),
    );

    const { result } = renderHook(() => useRoomsList());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.conversations).toHaveLength(0);

    window.dispatchEvent(new Event(CHAT_ROOMS_INVALIDATE_EVENT));
    await waitFor(() => expect(result.current.conversations).toHaveLength(1));

    const roomChangedListeners = listeners.get(CHAT_SOCKET_EVENTS.roomsChanged);
    roomChangedListeners?.forEach((cb) => cb({ roomId: "dm-2" }));
    await waitFor(() => expect(call).toBeGreaterThanOrEqual(3));
  });
});
