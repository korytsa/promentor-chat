export type MessageSenderDto = {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
};

export type MessageDto = {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender: MessageSenderDto;
  isOwn: boolean;
};

export type MessagesPageDto = {
  items: MessageDto[];
  total: number;
  limit: number;
  offset: number;
};
