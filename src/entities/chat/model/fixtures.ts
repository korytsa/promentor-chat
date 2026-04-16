import type { ChatMessage, Conversation } from "./types";

export type SearchUser = {
  id: string;
  name: string;
  avatarUrl: string;
  chatId?: string;
};

export const CHAT_WINDOW_AVATAR_STACK_URLS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
] as const;

export const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    title: "Marcus Thorne",
    updatedAt: "Just now",
    category: "direct",
    avatarUrls: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    ],
  },
  {
    id: "2",
    title: "Sarah Chen",
    updatedAt: "14:20",
    category: "direct",
    avatarUrls: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    ],
  },
  {
    id: "3",
    title: "Design Sync",
    updatedAt: "Yesterday",
    category: "group",
    avatarUrls: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    ],
  },
  {
    id: "4",
    title: "Marketing Plan",
    updatedAt: "Mon",
    category: "group",
    avatarUrls: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    ],
  },
  {
    id: "5",
    title: "Omar Alexander",
    updatedAt: "Tue",
    category: "direct",
    avatarUrls: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    ],
  },
];

export const MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    author: "Sarah Chen",
    time: "10:42 AM",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    text: "Hey team! I uploaded the latest mobile dark mode prototype. Can you review the elevation tokens?",
  },
  {
    id: "m2",
    role: "user",
    author: "You",
    time: "10:45 AM",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
    text: "Checking now. The surface color feels bright on OLED, maybe we can shift it slightly deeper.",
  },
  {
    id: "m3",
    role: "assistant",
    author: "Marcus Thorne",
    time: "11:02 AM",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    text: "Agreed. If we move it closer to deep navy, the contrast still passes and the interface looks calmer.",
  },
];

export const SEARCH_USERS: SearchUser[] = [
  {
    id: "u1",
    name: "Oliver Hansen",
    chatId: "1",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80",
  },
  {
    id: "u2",
    name: "Van Henry",
    chatId: "2",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
  },
  {
    id: "u3",
    name: "April Tucker",
    chatId: "3",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
  },
  {
    id: "u4",
    name: "Ralph Hubbard",
    chatId: "4",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
  },
  {
    id: "u5",
    name: "Omar Alexander",
    chatId: "5",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
  },
];
