export const CHAT_SOCKET_EVENTS = {
  join: "join",
  leave: "leave",
  newMessage: "chat:newMessage",
  typing: "typing",
  presence: "presence",
  error: "chat:error",
} as const;
