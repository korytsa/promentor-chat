import { Typography } from "@promentorapp/ui-kit";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { SearchUser } from "../../../entities/chat";
import { Avatar } from "../../../shared/ui/Avatar";
import type { RefObject } from "react";

type Props = {
  query: string;
  setQuery: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  filteredUsers: SearchUser[];
};

export function GlobalChatSearch({
  query,
  setQuery,
  isOpen,
  setIsOpen,
  containerRef,
  filteredUsers,
}: Props) {
  const navigate = useNavigate();

  return (
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
                <Typography component="span" className="text-sm!">{user.name}</Typography>
              </button>
            ))
          ) : (
            <Typography component="p" variantStyle="caption">No users found</Typography>
          )}
        </div>
      ) : null}
    </section>
  );
}
