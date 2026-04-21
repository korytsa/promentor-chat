import type { MessageSenderDto } from "../api/types/message";
import { toStringId } from "./normalizeMessagePayload";

function isSenderDto(x: unknown): x is MessageSenderDto {
  if (!x || typeof x !== "object") {
    return false;
  }
  const o = x as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.fullName === "string";
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return null;
}

export function normalizeSender(payload: Record<string, unknown>): MessageSenderDto | null {
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
