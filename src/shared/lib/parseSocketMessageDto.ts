import type { MessageDto, MessageSenderDto } from "../api/types/message";

function isSenderDto(x: unknown): x is MessageSenderDto {
  if (!x || typeof x !== "object") {
    return false;
  }
  const o = x as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.fullName === "string";
}

function toIsoString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  return null;
}

function toStringId(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return null;
}

function resolvePayload(o: Record<string, unknown>): Record<string, unknown> {
  const candidates = [o.message, o.payload, o.data];
  for (const c of candidates) {
    const nested = toRecord(c);
    if (nested) {
      return nested;
    }
  }
  return o;
}

function parseSender(payload: Record<string, unknown>): MessageSenderDto | null {
  const senderRaw = payload.sender;
  if (isSenderDto(senderRaw)) {
    return senderRaw;
  }
  const senderObj = toRecord(senderRaw);
  if (senderObj) {
    const senderIdFromObj = toStringId(senderObj.id);
    const senderFullNameFromObj =
      typeof senderObj.fullName === "string"
        ? senderObj.fullName
        : typeof senderObj.name === "string"
          ? senderObj.name
          : null;
    if (senderIdFromObj && senderFullNameFromObj) {
      return {
        id: senderIdFromObj,
        fullName: senderFullNameFromObj,
        avatarUrl: typeof senderObj.avatarUrl === "string" ? senderObj.avatarUrl : null,
      };
    }
  }
  const senderId = toStringId(payload.senderId);
  const fallbackFullName =
    typeof payload.senderFullName === "string"
      ? payload.senderFullName
      : typeof payload.senderName === "string"
        ? payload.senderName
      : typeof payload.authorName === "string"
        ? payload.authorName
        : "Unknown user";
  if (!senderId) {
    return null;
  }
  return {
    id: senderId,
    fullName: fallbackFullName,
    avatarUrl: typeof payload.senderAvatarUrl === "string" ? payload.senderAvatarUrl : null,
  };
}

export function parseMessageDtoFromSocket(raw: unknown): MessageDto | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const payload = resolvePayload(o);

  const createdAt = toIsoString(payload.createdAt);
  const messageText =
    typeof payload.message === "string"
      ? payload.message
      : typeof payload.text === "string"
        ? payload.text
        : null;
  const sender = parseSender(payload);
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
