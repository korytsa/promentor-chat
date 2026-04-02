import "../../index.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CONVERSATIONS, SEARCH_USERS, type Conversation } from "../../entities/chat";
import { CURRENT_USER_PROFILE } from "../../entities/profile";
import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { Avatar } from "../../shared/ui/Avatar";
import { CreateGroupLink } from "../../shared/ui/CreateGroupLink";

function ConversationAvatar({ conversation }: { conversation: Conversation }) {
  if (conversation.category === "group") {
    return (
      <div className="flex">
        {conversation.avatarUrls.slice(0, 3).map((avatarUrl, index) => (
          <div
            key={avatarUrl}
            className={index === 0 ? "" : "-ml-3"}
          >
            <Avatar
              user={{ name: conversation.title, avatarUrl }}
              size="sm"
            />
          </div>
        ))}
      </div>
    );
  }

  const avatarUrl = conversation.avatarUrls[0];

  return (
    <Avatar user={{ name: conversation.title, avatarUrl }} size="sm" />
  );
}

export default function ChatSidebar() {


  const directMessages = CONVERSATIONS.filter(
    (conversation) => conversation.category === "direct",
  );
  const groupMessages = CONVERSATIONS.filter(
    (conversation) => conversation.category === "group",
  );

  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filteredUsers = useMemo(
    () =>
      SEARCH_USERS.filter((user) =>
        user.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const renderConversationList = (items: Conversation[]) =>
    items.map((item) => (
      <NavLink
        key={item.id}
        to={`/chat/${item.id}`}
        className={({ isActive }) =>
          [
            "w-full rounded-lg border px-2 py-1 transition",
            isActive
              ? "border-white/20 bg-white/10"
              : "border-white/20 hover:border-white/30 hover:bg-white/10",
          ].join(" ")
        }
      >
        <div className="flex items-center gap-3">
          <ConversationAvatar conversation={item} />
          <div>
            <p className="text-sm font-medium text-[#deebff]">{item.title}</p>
            <p className="text-xs text-[#9bb4df]">{item.updatedAt}</p>
          </div>
        </div>
      </NavLink>
    ));

  return (
    <div className="hidden w-[280px] flex-col gap-5 rounded-l-lg border border-r-0 border-white/20 p-2 lg:flex">
      <section className="border-b border-white/20 pb-2">
        <Link
          to="/chat/profile"
          className="flex items-center gap-3"
        >
          <Avatar
            user={{
              name: CURRENT_USER_PROFILE.displayName,
              avatarUrl: CURRENT_USER_PROFILE.avatarUrl,
            }}
            size="md"
          />
          <div>
            <p className="text-sm font-semibold text-[#f3f7ff]">{CURRENT_USER_PROFILE.displayName}</p>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </Link>
      </section>

      <section ref={containerRef} className="relative w-full max-w-xs">
        <label className="sr-only" htmlFor="global-chat-search">
          Search conversations
        </label>
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#88a2d2]">
          <FiSearch size={16} />
        </span>
        <input
          id="global-chat-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search conversation..."
          className="py-2.5 w-full rounded-lg border border-white/20 pl-10 pr-3 text-sm text-[#eaf2ff] outline-none placeholder:text-[#88a2d2] focus:border-[#2a6de5]"
          autoComplete="off"
        />

        {isOpen ? (
          <div className="hide-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-[268px] overflow-y-auto rounded-lg border border-white/20 bg-[#0f1f3d] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    navigate(`/chat/${user.chatId}`);
                    setQuery("");
                    setIsOpen(false);
                  }}
                  className="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/12 bg-white/8 px-2 py-1 text-left transition last:mb-0 hover:bg-white/12"
                >
                  <Avatar
                    user={{ name: user.name, avatarUrl: user.avatarUrl }}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-[#eff5ff]">{user.name}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-sm text-[#9bb4df]">No users found</p>
            )}
          </div>
        ) : null}
      </section>

      <section>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9bb4df]">
          Direct Messages
        </p>
        <div className="flex flex-col gap-2">{renderConversationList(directMessages)}</div>
      </section>

      <section>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9bb4df]">
          Groups
        </p>
        <div className="flex flex-col gap-2">
          {renderConversationList(groupMessages)}
          <CreateGroupLink />
        </div>
      </section>
    </div>
  );
}
