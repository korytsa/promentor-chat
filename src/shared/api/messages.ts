import { apiFetch, apiJson } from "./client";
import { roomsBasePath } from "./rooms";
import type { MessageDto, MessagesPageDto } from "./types/message";

export async function fetchRoomMessages(
  roomId: string,
  params?: { limit?: number; offset?: number },
): Promise<MessagesPageDto> {
  const search = new URLSearchParams();
  if (params?.limit != null) {
    search.set("limit", String(params.limit));
  }
  if (params?.offset != null) {
    search.set("offset", String(params.offset));
  }
  const qs = search.toString();
  const url = `${roomsBasePath()}/${encodeURIComponent(roomId)}/messages${qs ? `?${qs}` : ""}`;
  return apiJson<MessagesPageDto>(url);
}

export async function sendRoomMessage(
  roomId: string,
  body: { message: string },
): Promise<MessageDto | null> {
  const response = await apiFetch(
    `${roomsBasePath()}/${encodeURIComponent(roomId)}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }
  return JSON.parse(text) as MessageDto;
}

export type MarkRoomReadBody = {
  messageId?: string;
};

export async function markRoomRead(
  roomId: string,
  body: MarkRoomReadBody = {},
): Promise<void> {
  await apiFetch(`${roomsBasePath()}/${encodeURIComponent(roomId)}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
