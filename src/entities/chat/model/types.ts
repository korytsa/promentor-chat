export type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  category: "direct" | "group";
  avatarUrls: string[];
};

export type MessageRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  author: string;
  time: string;
  avatarUrl?: string;
  authorProfileSlug?: string;
  text: string;
};
