export const CHAT_SOCKET_EVENTS = {
  join: "chat:joinRoom",
  leave: "chat:leaveRoom",
  newMessage: "chat:newMessage",
  roomsChanged: "rooms:changed",
  sendMessage: "chat:sendMessage",
  typing: "chat:typing",
  roomPresence: "chat:roomPresence",
  error: "chat:error",
} as const;
