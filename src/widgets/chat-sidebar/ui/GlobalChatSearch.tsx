import { Typography, TextField } from "@promentorapp/ui-kit";
import { FiSearch } from "react-icons/fi";
import { useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchUser } from "../../../entities/chat";
import type { RefObject } from "react";
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
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();

  const openChatFromIndex = (index: number) => {
    const user = filteredUsers[index];
    if (!user) {
      return;
    }
    navigate(`/chat/${user.chatId}`);
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
  };

  useEffect(() => {
    if (!isOpen || filteredUsers.length === 0) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((current) => {
      if (current < 0) {
        return 0;
      }
      if (current >= filteredUsers.length) {
        return filteredUsers.length - 1;
      }
      return current;
    });
  }, [filteredUsers.length, isOpen]);

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
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (!isOpen && event.key === "ArrowDown" && filteredUsers.length > 0) {
              event.preventDefault();
              setIsOpen(true);
              setActiveIndex(0);
              return;
            }

            if (!isOpen) {
              return;
            }

            if (event.key === "Escape") {
              event.preventDefault();
              setIsOpen(false);
              setActiveIndex(-1);
              return;
            }

            if (filteredUsers.length === 0) {
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) => (current + 1) % filteredUsers.length);
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) =>
                current <= 0 ? filteredUsers.length - 1 : current - 1,
              );
              return;
            }

            if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              openChatFromIndex(activeIndex);
            }
          }}
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
                ariaSelected={index === activeIndex}
                tabIndex={-1}
                name={user.name}
                avatarUrl={user.avatarUrl}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => openChatFromIndex(index)}
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
