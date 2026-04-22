import { useId, useState } from "react";
import type { KeyboardEvent } from "react";
import type { ChatSearchOption } from "../../../entities/chat";

type Params = {
  isOpen: boolean;
  filteredUsers: ChatSearchOption[];
  setQuery: (value: string) => void;
  setIsOpen: (value: boolean) => void;
  onSelectOption: (option: ChatSearchOption) => boolean | Promise<boolean>;
};

export function useGlobalChatSearchModel({
  isOpen,
  filteredUsers,
  setQuery,
  setIsOpen,
  onSelectOption,
}: Params) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();

  const hasResults = isOpen && filteredUsers.length > 0;
  const normalizedActiveIndex = hasResults
    ? activeIndex < 0
      ? 0
      : Math.min(activeIndex, filteredUsers.length - 1)
    : -1;

  const closeListbox = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const openChatFromIndex = async (index: number) => {
    const user = filteredUsers[index];
    if (!user) {
      return;
    }

    const ok = await Promise.resolve(onSelectOption(user));
    if (ok === false) {
      return;
    }

    setQuery("");
    closeListbox();
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    setActiveIndex(0);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setActiveIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
      closeListbox();
      return;
    }

    if (filteredUsers.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((normalizedActiveIndex + 1) % filteredUsers.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        normalizedActiveIndex <= 0 ? filteredUsers.length - 1 : normalizedActiveIndex - 1,
      );
      return;
    }

    if (event.key === "Enter" && normalizedActiveIndex >= 0) {
      event.preventDefault();
      void openChatFromIndex(normalizedActiveIndex);
    }
  };

  return {
    listboxId,
    normalizedActiveIndex,
    handleQueryChange,
    handleFocus,
    handleKeyDown,
    handleOptionMouseEnter: setActiveIndex,
    handleOptionClick: openChatFromIndex,
  };
}
