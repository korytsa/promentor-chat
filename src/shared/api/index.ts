export { getApiBaseUrl } from "./config";
export { ApiError } from "./error";
export { parseApiFailure } from "./parseApiFailure";
export { apiFetch, apiJson } from "./client";
export { fetchRoomById, fetchRooms, roomsBasePath } from "./rooms";
export { fetchRoomMessages, markRoomRead, sendRoomMessage } from "./messages";
export type {
  ChatRoomTypeResponse,
  CreateRoomDto,
  RoomDetailDto,
  RoomListItemDto,
} from "./types/room";
export type { MessageDto, MessagesPageDto, MessageSenderDto } from "./types/message";
