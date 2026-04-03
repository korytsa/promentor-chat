import { Navigate } from "react-router-dom";
import { Typography } from "@promentorapp/ui-kit";
import { BiExit } from "react-icons/bi";
import { CHAT_WINDOW_AVATAR_STACK_URLS, MESSAGES, MessageBubble } from "../../../entities/chat";
import { ChatCompose } from "../../../features/chat-compose";
import { Avatar } from "../../../shared/ui/Avatar";
import { CHAT_PAGE_COPY } from "../model/constants";
import { useChatPage } from "../model/useChatPage";

export default function ChatPage() {
  const state = useChatPage();

  if (state.status === "empty") {
    return null;
  }

  if (state.status === "redirect") {
    return <Navigate to={state.to} replace={state.replace} />;
  }

  const { activeConversation, resolveProfilePath } = state.viewModel;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-r-lg border border-t-0 border-white/20">
      <header className="flex shrink-0 items-center rounded-tr-lg border-t border-b border-white/20 px-4 py-2">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {CHAT_WINDOW_AVATAR_STACK_URLS.map((src, index) => (
                <div key={src} className={index === 0 ? "" : "-ml-2"}>
                  <Avatar
                    user={{
                      name: CHAT_PAGE_COPY.stackAvatarPlaceholderName,
                      avatarUrl: src,
                    }}
                    size="sm"
                  />
                </div>
              ))}
              <Typography
                component="span"
                className="-ml-2 grid h-8 min-w-8 place-items-center rounded-full border border-blue-400 px-2 font-semibold text-[#e5efff]"
              >
                {CHAT_PAGE_COPY.overflowCountLabel}
              </Typography>
            </div>
            <div>
              <Typography component="h2" variantStyle="subtitle" className="text-sm!">
                {activeConversation.title}
              </Typography>
              <Typography component="p" variantStyle="caption" className="text-xs! text-[#1bd695]!">
                {CHAT_PAGE_COPY.activeNowLabel}
              </Typography>
            </div>
          </div>

          <button className="flex cursor-pointer items-center gap-1.5 text-xs text-red-500 transition hover:text-red-400">
            <BiExit className="text-sm" />
            Leave Group
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {MESSAGES.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            resolveProfilePath={resolveProfilePath}
          />
        ))}
      </div>

      <ChatCompose />
    </div>
  );
}
