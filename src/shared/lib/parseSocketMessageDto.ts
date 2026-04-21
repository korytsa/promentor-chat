import type { MessageDto } from "../api/types/message";
import { normalizeMessagePayload, toIsoString, toStringId } from "./normalizeMessagePayload";
import { normalizeSender } from "./normalizeSender";

export function parseMessageDtoFromSocket(raw: unknown): MessageDto | null {
  const payload = normalizeMessagePayload(raw);
  if (!payload) {
    return null;
  }

  const createdAt = toIsoString(payload.createdAt);
  const messageText =
    typeof payload.message === "string"
      ? payload.message
      : typeof payload.text === "string"
        ? payload.text
        : null;
  const sender = normalizeSender(payload);
  const id = toStringId(payload.id);
  const roomId = toStringId(payload.roomId);
  const senderId = toStringId(payload.senderId);
  const clientMessageIdRaw = payload.clientMessageId;
  const clientMessageId =
    typeof clientMessageIdRaw === "string" && clientMessageIdRaw.trim()
      ? clientMessageIdRaw
      : undefined;

  if (
    !id ||
    !roomId ||
    !senderId ||
    !messageText ||
    !createdAt ||
    !sender
  ) {
    return null;
  }

  const isOwn = typeof payload.isOwn === "boolean" ? payload.isOwn : false;

  return {
    id,
    roomId,
    senderId,
    message: messageText,
    createdAt,
    sender,
    isOwn,
    clientMessageId,
  };
}
