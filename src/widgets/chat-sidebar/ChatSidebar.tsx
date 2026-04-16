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
  const { session, isBridgeAvailable, isHydrating } = useHostAuthSession();
  const {
    search,
    directMessages,
    groupMessages,
    categoryClassName,
    visibilityClassName,
    errorMessage,
    status: roomsStatus,
  } = useChatSidebarModel();

  const sessionLabel = (() => {
    if (isHydrating) {
      return "Loading session…";
    }
    if (!isBridgeAvailable) {
      return "Auth bridge unavailable";
    }
    if (session.isAuthenticated && session.user) {
      return session.user.fullName;
    }
    return "Not signed in";
  })();

  return (
    <div
      className={[
        "flex w-full flex-col gap-3 rounded-lg sm:border border-white/20 p-4 sm:p-2 md:w-[280px]",
        className ?? "",
      ].join(" ")}
    >
      <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">
        <Typography component="p" variantStyle="caption" className="text-white/50">
          Signed in as
        </Typography>
        <Typography component="p" variantStyle="subtitle" className="truncate text-sm">
          {sessionLabel}
        </Typography>
        {session.user ? (
          <Typography component="p" variantStyle="caption" className="mt-0.5 truncate text-white/45">
            {session.user.email}
          </Typography>
        ) : null}
      </div>

      <div
        className={["flex flex-col gap-5", visibilityClassName].join(" ")}
      >
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
