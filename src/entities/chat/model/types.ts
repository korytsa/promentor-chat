export type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  category: "direct" | "group";
  avatarUrls: string[];
};

export type ChatSearchOption = {
  id: string;
  name: string;
  avatarUrl: string;
  isUserOnly?: boolean;
};

export type MessageRole = "assistant" | "user";

export type ChatRoomMessageView = {
  id: string;
  createdAt: string;
  text: string;
  timeLabel: string;
  authorName: string;
  avatarUrl?: string;
  isOwn: boolean;
  pending?: boolean;
};

export type ChatMessage = {
  id: string;
  role: MessageRole;
  author: string;
  time: string;
  avatarUrl?: string;
  text: string;
};
