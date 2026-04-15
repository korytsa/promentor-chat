import { Typography, Avatar, Button } from "@promentorapp/ui-kit";
import { BiExit } from "react-icons/bi";
import { useParams } from "react-router-dom";
import { MessageBubble } from "../../../entities/chat";
import { ChatCompose } from "../../../features/chat-compose";
import { MobileBackLink } from "../../../shared/ui/MobileBackLink";
import { CHAT_PAGE_COPY } from "../model/constants";
import { useChatPage } from "../model/useChatPage";
import { useChatRoomMessages } from "../model/useChatRoomMessages";

export default function ChatPage() {
  const { chatId } = useParams();
  const pageState = useChatPage();
  const {
    items: messages,
    isLoading: messagesLoading,
    errorMessage: messagesError,
    send,
    isSending,
    sendError,
  } = useChatRoomMessages(chatId);

  if (pageState.status === "empty") {
    return null;
  }

  if (pageState.status === "loading") {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center sm:rounded-lg sm:border border-white/20 px-4 py-12">
        <Typography component="p" variantStyle="body">
          Loading conversation…
        </Typography>
      </div>
    );
  }

  if (pageState.status === "error") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 sm:rounded-lg sm:border border-white/20 px-4 py-12">
        <Typography component="p" variantStyle="subtitle">
          Something went wrong
        </Typography>
        <Typography component="p" variantStyle="caption" className="text-center text-white/70">
          {pageState.message}
        </Typography>
      </div>
    );
  }

  const { activeConversation } = pageState.viewModel;
  const headerAvatars = activeConversation.avatarUrls.slice(0, 3);
  const overflowCount =
    activeConversation.avatarUrls.length > 3
      ? activeConversation.avatarUrls.length - 3
      : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-lg sm:border border-white/20">
      <header className="flex shrink-0 items-center rounded-tr-lg border-b border-white/20 px-4 py-2">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <MobileBackLink />
            <div className="hidden sm:flex items-center">
              {headerAvatars.length > 0 ? (
                headerAvatars.map((src, index) => (
                  <div key={`${src}-${index}`} className={index === 0 ? "" : "-ml-2"}>
                    <Avatar
                      user={{
                        name: CHAT_PAGE_COPY.stackAvatarPlaceholderName,
                        avatarUrl: src,
                      }}
                      size="sm"
                    />
                  </div>
                ))
              ) : (
                <Avatar
                  user={{ name: activeConversation.title }}
                  size="sm"
                />
              )}
              {overflowCount > 0 ? (
                <Typography
                  component="span"
                  className="-ml-2 grid h-8 min-w-8 place-items-center rounded-full border border-blue-400 px-2 font-semibold text-[#e5efff]"
                >
                  +{overflowCount}
                </Typography>
              ) : null}
            </div>
            <div>
              <Typography component="h2" variantStyle="subtitle" className="text-sm">
                {activeConversation.title}
              </Typography>
              <Typography component="p" variantStyle="caption" className="text-xs text-[#1bd695]">
                {CHAT_PAGE_COPY.activeNowLabel}
              </Typography>
            </div>
          </div>

          <Button type="button" variant="text" color="error">
            <BiExit className="text-sm" />
            {CHAT_PAGE_COPY.leaveGroup}
          </Button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center px-4 py-8">
            <Typography component="p" variantStyle="caption" className="text-white/60">
              Loading messages…
            </Typography>
          </div>
        ) : messagesError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-8">
            <Typography component="p" variantStyle="caption" className="text-center text-red-200/90">
              {messagesError}
            </Typography>
          </div>
        ) : (
          <div className="hide-scrollbar h-full space-y-4 overflow-y-auto px-4 py-5">
            {messages.length === 0 ? (
              <Typography component="p" variantStyle="caption" className="text-center text-white/50">
                No messages yet. Say hello.
              </Typography>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
          </div>
        )}
      </div>

      <ChatCompose
        onSend={send}
        disabled={messagesLoading || Boolean(messagesError)}
        isSending={isSending}
        sendError={sendError}
      />
    </div>
  );
}
