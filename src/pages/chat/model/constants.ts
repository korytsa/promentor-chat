export const CHAT_PAGE_COPY = {
  stackAvatarPlaceholderName: "Team member",
  overflowCountLabel: "+8",
  typingOthers: "Someone is typing…",
  leaveDirect: "Leave chat",
  leaveGroup: "Leave group",
} as const;

export const CHAT_MESSAGE_PAGE_SIZE = 30;
export const CHAT_TYPING_IDLE_MS = 1800;
export const CHAT_SCROLL_LOAD_TOP_PX = 72;
export const CHAT_READ_SCROLL_BOTTOM_PX = 96;
export const CHAT_READ_SCROLL_DEBOUNCE_MS = 320;

export const CHAT_ROOM_LOAD_MESSAGES_FAILURE = {
  fallback: "Could not load messages.",
  unauthorized: "Sign in to view messages.",
} as const;

export const CHAT_ROOM_LOAD_OLDER_FAILURE = {
  fallback: "Could not load older messages.",
  unauthorized: "Sign in to load messages.",
} as const;

export const CHAT_ROOM_SEND_MESSAGE_FAILURE = {
  fallback: "Could not send message.",
  unauthorized: "Sign in to send messages.",
} as const;

export const CHAT_LEAVE_ROOM_FAILURE = {
  fallback: "Could not leave this chat.",
  unauthorized: "Sign in to leave this chat.",
  notFound: "This chat is no longer available.",
} as const;

export const CHAT_SEARCH_DM_FAILURE = {
  fallback: "Could not start a direct chat.",
  unauthorized: "Sign in to start a chat.",
} as const;

export const CHAT_SIDEBAR_USER_SEARCH_FAILURE = {
  fallback: "Could not search users.",
  unauthorized: "Sign in to search users.",
  rateLimited: "Too many searches. Wait a moment and try again.",
} as const;
