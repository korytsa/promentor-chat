import { Typography, TextField } from "@promentorapp/ui-kit";
import { FiSearch } from "react-icons/fi";
import type { SearchUser } from "../../../entities/chat";
import type { RefObject } from "react";
import { useGlobalChatSearchModel } from "../model/useGlobalChatSearchModel";
import { UserListItem } from "../../../shared/ui/UserListItem";

type Props = {
  query: string;
  isOpen: boolean;
  filteredUsers: SearchUser[];
  setQuery: (value: string) => void;
  setIsOpen: (value: boolean) => void;
  containerRef: RefObject<HTMLDivElement | null>;
};

export function GlobalChatSearch({
  query,
  setQuery,
  isOpen,
  setIsOpen,
  containerRef,
  filteredUsers,
}: Props) {
  const {
    listboxId,
    normalizedActiveIndex,
    handleQueryChange,
    handleFocus,
    handleKeyDown,
    handleOptionMouseEnter,
    handleOptionClick,
  } = useGlobalChatSearchModel({ isOpen, filteredUsers, setQuery, setIsOpen });

  return (
    <section ref={containerRef} className="relative w-full sm:max-w-xs">
      <label className="sr-only" htmlFor="global-chat-search">
        Search conversations
      </label>
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
        <FiSearch className="text-white/50" />
      </span>
      <div className="[&>label]:gap-0 [&>label>p]:sr-only">
        <TextField
          id="global-chat-search"
          label="Search conversations"
          aria-label="Search conversations"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            normalizedActiveIndex >= 0 ? `${listboxId}-option-${normalizedActiveIndex}` : undefined
          }
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search conversation..."
          autoComplete="off"
          className="h-11! border-white/20! bg-transparent! py-2.5! pl-10! pr-3! text-sm! focus:border-[#2a6de5]!"
        />
      </div>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="hide-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-[268px] overflow-y-auto rounded-lg border border-white/20 bg-[#0f1f3d] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <UserListItem
                key={user.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                ariaSelected={index === normalizedActiveIndex}
                tabIndex={-1}
                name={user.name}
                avatarUrl={user.avatarUrl}
                onMouseEnter={() => handleOptionMouseEnter(index)}
                onClick={() => handleOptionClick(index)}
                className="mb-2 last:mb-0"
              />
            ))
          ) : (
            <Typography component="p" variantStyle="caption">
              No users found
            </Typography>
          )}
        </div>
      ) : null}
    </section>
  );
}
