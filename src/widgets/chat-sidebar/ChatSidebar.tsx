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
  const {
    search,
    directMessages,
    groupMessages,
    categoryClassName,
    visibilityClassName,
    errorMessage,
    status: roomsStatus,
  } = useChatSidebarModel({ excludeUserId: session.user?.id });

  return (
    <div
      className={[
        "flex w-full flex-col gap-3 rounded-lg sm:border border-white/20 p-4 sm:p-2 md:w-[280px]",
        className ?? "",
      ].join(" ")}
    >
      <div className={["flex flex-col gap-5", visibilityClassName].join(" ")}>
        <GlobalChatSearch
          query={search.query}
          setQuery={search.setQuery}
          isOpen={search.isOpen}
          setIsOpen={search.setIsOpen}
          containerRef={search.containerRef}
          filteredUsers={search.filteredUsers}
          onSelectOption={search.onSelectSearchOption}
          userSearchLoading={search.userSearchLoading}
          userSearchError={search.userSearchError}
          directoryLoading={search.directoryLoading}
          directoryError={search.directoryError}
          dmCreateError={search.dmCreateError}
        />

        {errorMessage ? (
          <Typography component="p" variantStyle="caption" className="text-amber-200/90">
            {errorMessage}
          </Typography>
        ) : null}

        {roomsStatus === "loading" ? (
          <Typography component="p" variantStyle="caption" className="text-white/50">
            Loading conversations…
          </Typography>
        ) : null}

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
    </div>
  );
}
