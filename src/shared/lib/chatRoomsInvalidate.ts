export const CHAT_ROOMS_INVALIDATE_EVENT = "promentor-chat:rooms-invalidate";

export function dispatchChatRoomsInvalidate(): void {
  window.dispatchEvent(new CustomEvent(CHAT_ROOMS_INVALIDATE_EVENT));
}
