export const CHAT_PAGE_COPY = {
  stackAvatarPlaceholderName: "Team member",
  overflowCountLabel: "+8",
  activeNowLabel: "12 active now",
  leaveGroup: "Leave Group",
} as const;

export const CHAT_ROOM_LOAD_MESSAGES_FAILURE = {
  fallback: "Could not load messages.",
  unauthorized: "Sign in to view messages.",
} as const;

export const CHAT_ROOM_SEND_MESSAGE_FAILURE = {
  fallback: "Could not send message.",
  unauthorized: "Sign in to send messages.",
} as const;
