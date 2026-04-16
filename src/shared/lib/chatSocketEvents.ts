export const CHAT_SOCKET_EVENTS = {
  join: "chat:joinRoom",
  leave: "chat:leaveRoom",
  newMessage: "chat:newMessage",
  sendMessage: "chat:sendMessage",
  typing: "chat:typing",
  roomPresence: "chat:roomPresence",
  error: "chat:error",
} as const;
