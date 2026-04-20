import { useEffect } from "react";
import { Typography } from "@promentorapp/ui-kit";
import { useHostAuthSession } from "../../features/auth";
import { CreateGroupLink } from "../../shared/ui/CreateGroupLink";
import { useChatSidebarModel } from "./model/useChatSidebarModel";
import { ConversationListItem } from "./ui/ConversationListItem";
import { GlobalChatSearch } from "./ui/GlobalChatSearch";

type ChatSidebarProps = {
  className?: string;
};

export default function ChatSidebar({ className }: ChatSidebarProps) {
  const { session } = useHostAuthSession();
  const { search, directMessages, groupMessages, categoryClassName, visibilityClassName } =
    useChatSidebarModel();

  useEffect(() => {
    console.log(session.user);
  }, [session]);

  return (
    <div
      className={[
        "w-full flex-col gap-5 rounded-lg sm:border border-white/20 p-4 sm:p-2 md:w-[280px]",
        visibilityClassName,
        className ?? "",
      ].join(" ")}
    >
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
