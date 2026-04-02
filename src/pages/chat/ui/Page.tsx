import { Navigate, useParams } from "react-router-dom";
import { BiExit } from "react-icons/bi";
import {
  CHAT_WINDOW_AVATAR_STACK_URLS,
  CONVERSATIONS,
  MESSAGES,
  MessageBubble,
} from "../../../entities/chat";
import { CURRENT_USER_SLUG } from "../../../entities/profile";
import { ChatCompose } from "../../../features/chat-compose";
import { Avatar } from "../../../shared/ui/Avatar";

export default function ChatPage() {
  const { chatId } = useParams();
  const activeConversation = CONVERSATIONS.find((conversation) => conversation.id === chatId);
  const fallbackId = CONVERSATIONS[0]?.id;

  if (!activeConversation) {
    if (!fallbackId) {
      return null;
    }

    return <Navigate to={`/chat/${fallbackId}`} replace />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-r-lg border border-t-0 border-white/20">
      <header className="flex shrink-0 items-center rounded-tr-lg border-t border-b border-white/20 px-4 py-2">
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {CHAT_WINDOW_AVATAR_STACK_URLS.map((src, index) => (
                <div
                  key={src}
                  className={index === 0 ? "" : "-ml-2"}
                >
                  <Avatar user={{ name: "Team member", avatarUrl: src }} size="sm" />
                </div>
              ))}
              <span className="-ml-2 grid h-8 min-w-8 place-items-center rounded-full border border-blue-400 px-2 text-xs font-semibold text-[#e5efff]">
                +8
              </span>
            </div>
          <div>
            <h2 className="text-base font-semibold text-[#eff5ff]">{activeConversation.title}</h2>
            <p className="text-xs text-[#1bd695]">12 active now</p>
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
            resolveProfilePath={(slug) =>
              slug === CURRENT_USER_SLUG
                ? "/chat/profile"
                : `/chat/profile/${slug}`
            }
          />
        ))}
      </div>

      <ChatCompose />
    </div>
  );
}
