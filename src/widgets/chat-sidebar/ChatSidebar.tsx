import { Typography, Avatar } from "@promentorapp/ui-kit";
import { Link, useLocation } from "react-router-dom";
import { CONVERSATIONS } from "../../entities/chat";
import { CURRENT_USER_PROFILE } from "../../entities/profile";
import { CreateGroupLink } from "../../shared/ui/CreateGroupLink";
import { useConversationSearch } from "./model/useConversationSearch";
import { ConversationListItem } from "./ui/ConversationListItem";
import { GlobalChatSearch } from "./ui/GlobalChatSearch";

type ChatSidebarProps = {
  className?: string;
};

export default function ChatSidebar({ className }: ChatSidebarProps) {
  const location = useLocation();
  const directMessages = CONVERSATIONS.filter((conversation) => conversation.category === "direct");
  const groupMessages = CONVERSATIONS.filter((conversation) => conversation.category === "group");

  const search = useConversationSearch();

  const categoryClassName = "mb-1! text-[12px]! font-bold! text-white/50!";
  const isListRoute = location.pathname === "/";
  const visibilityClassName = isListRoute ? "flex md:flex" : "hidden md:flex";

  return (
    <div
      className={[
        "w-full flex-col gap-5 rounded-lg sm:border border-white/20 p-4 sm:p-2 md:w-[280px]",
        visibilityClassName,
        className ?? "",
      ].join(" ")}
    >
      <section className="border-b border-white/20 pb-2">
        <Link to="/chat/profile" className="flex items-center gap-3">
          <Avatar
            user={{
              name: CURRENT_USER_PROFILE.displayName,
              avatarUrl: CURRENT_USER_PROFILE.avatarUrl,
            }}
            size="md"
          />
          <div>
            <Typography component="p" variantStyle="title">
              {CURRENT_USER_PROFILE.displayName}
            </Typography>
            <Typography component="p" className="text-xs! text-green-600!">
              Online
            </Typography>
          </div>
        </Link>
      </section>

      <GlobalChatSearch
        query={search.query}
        setQuery={search.setQuery}
        isOpen={search.isOpen}
        setIsOpen={search.setIsOpen}
        containerRef={search.containerRef}
        filteredUsers={search.filteredUsers}
      />

      <section>
        <Typography component="p" variantStyle="eyebrow" className={categoryClassName}>
          Direct Messages
        </Typography>
        <div className="flex flex-col gap-2">
          {directMessages.map((conversation) => (
            <ConversationListItem key={conversation.id} conversation={conversation} />
          ))}
        </div>
      </section>

      <section>
        <Typography component="p" variantStyle="eyebrow" className={categoryClassName}>
          Groups
        </Typography>
        <div className="flex flex-col gap-2">
          {groupMessages.map((conversation) => (
            <ConversationListItem key={conversation.id} conversation={conversation} />
          ))}
          <CreateGroupLink />
        </div>
      </section>
    </div>
  );
}
