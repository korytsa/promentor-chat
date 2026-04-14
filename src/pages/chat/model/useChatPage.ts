import { useParams } from "react-router-dom";
import { CONVERSATIONS, type Conversation } from "../../../entities/chat";

export type ChatPageReadyViewModel = {
  activeConversation: Conversation;
};

export type ChatPageState =
  | { status: "empty" }
  | { status: "redirect"; to: string; replace: boolean }
  | { status: "ready"; viewModel: ChatPageReadyViewModel };

export function useChatPage(): ChatPageState {
  const { chatId } = useParams();
  const activeConversation = CONVERSATIONS.find((conversation) => conversation.id === chatId);
  const fallbackId = CONVERSATIONS[0]?.id;

  if (!activeConversation) {
    if (!fallbackId) {
      return { status: "empty" };
    }
    return { status: "redirect", to: `/chat/${fallbackId}`, replace: true };
  }

  return {
    status: "ready",
    viewModel: {
      activeConversation,
    },
  };
}
