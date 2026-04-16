import type { MessageDto, MessageSenderDto } from "../api/types/message";

function isSenderDto(x: unknown): x is MessageSenderDto {
  if (!x || typeof x !== "object") {
    return false;
  }
  const o = x as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.fullName === "string";
}

export function parseMessageDtoFromSocket(raw: unknown): MessageDto | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const payload =
    o.message && typeof o.message === "object" ? (o.message as Record<string, unknown>) : o;

  if (
    typeof payload.id !== "string" ||
    typeof payload.roomId !== "string" ||
    typeof payload.senderId !== "string" ||
    typeof payload.message !== "string" ||
    typeof payload.createdAt !== "string" ||
    !isSenderDto(payload.sender)
  ) {
    return null;
  }

  const isOwn = typeof payload.isOwn === "boolean" ? payload.isOwn : false;

  return {
    id: payload.id,
    roomId: payload.roomId,
    senderId: payload.senderId,
    message: payload.message,
    createdAt: payload.createdAt,
    sender: payload.sender,
    isOwn,
  };
}
