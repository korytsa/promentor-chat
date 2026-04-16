import { apiJson } from "./client";
import { getApiBaseUrl } from "./config";
import type { CreateRoomDto, RoomDetailDto, RoomListItemDto } from "./types/room";

export function roomsBasePath(): string {
  return `${getApiBaseUrl()}/rooms`;
}

export async function fetchRooms(): Promise<RoomListItemDto[]> {
  return apiJson<RoomListItemDto[]>(roomsBasePath());
}

export async function fetchRoomById(roomId: string): Promise<RoomDetailDto> {
  return apiJson<RoomDetailDto>(`${roomsBasePath()}/${encodeURIComponent(roomId)}`);
}

export async function createRoom(body: CreateRoomDto): Promise<RoomDetailDto> {
  return apiJson<RoomDetailDto>(roomsBasePath(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
