export { getApiBaseUrl } from "./config";
export { ApiError } from "./error";
export { parseApiFailure } from "./parseApiFailure";
export type { ParseApiFailureOptions } from "./parseApiFailure";
export { apiFetch, apiJson } from "./client";
export { createRoom, fetchRoomById, fetchRooms, removeSelfFromRoom, roomsBasePath } from "./rooms";
export { fetchAuthMe, authBasePath } from "./auth";
export { fetchUsers, searchUsers, usersBasePath } from "./users";
export { fetchRoomMessages, markRoomRead, sendRoomMessage } from "./messages";
export type { MarkRoomReadBody } from "./messages";
export type {
  ChatRoomTypeResponse,
  CreateRoomDto,
  RoomDetailDto,
  RoomListItemDto,
} from "./types/room";
export type { MessageDto, MessagesPageDto, MessageSenderDto } from "./types/message";
export type {
  AuthUserResponseDto,
  UserRole,
  UserSearchItemDto,
  UserSearchResultDto,
  UsersListPageDto,
} from "./types/user";
