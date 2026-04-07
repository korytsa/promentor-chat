import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { SEARCH_USERS, type SearchUser } from "../../../entities/chat";

export type CreateGroupPageViewModel = {
  selectorRef: RefObject<HTMLDivElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
  isDropdownOpen: boolean;
  selectedMemberIds: string[];
  selectedMembers: SearchUser[];
  filteredMembers: SearchUser[];
  toggleMember: (memberId: string) => void;
  removeMember: (memberId: string) => void;
  onSelectorAreaClick: () => void;
  onInviteInputFocus: () => void;
};

export function useCreateGroupPage(): CreateGroupPageViewModel {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  const filteredMembers = SEARCH_USERS.filter((member) =>
    member.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const selectedMembers = SEARCH_USERS.filter((member) => selectedMemberIds.includes(member.id));

  const closeSelectorIfEmpty = (memberIds: string[]) => {
    if (memberIds.length === 0) {
      setIsDropdownOpen(false);
      setQuery("");
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((current) => {
      const isSelected = current.includes(memberId);
      const nextSelectedMemberIds = isSelected
        ? current.filter((id) => id !== memberId)
        : [...current, memberId];

      closeSelectorIfEmpty(nextSelectedMemberIds);
      return nextSelectedMemberIds;
    });
  };

  const removeMember = (memberId: string) => {
    setSelectedMemberIds((current) => {
      const nextSelectedMemberIds = current.filter((id) => id !== memberId);
      closeSelectorIfEmpty(nextSelectedMemberIds);
      return nextSelectedMemberIds;
    });
  };

  const onQueryChange = (value: string) => {
    setQuery(value);
    setIsDropdownOpen(true);
  };

  const onSelectorAreaClick = () => {
    setIsDropdownOpen(true);
  };

  const onInviteInputFocus = () => {
    setIsDropdownOpen(true);
  };

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!selectorRef.current) {
        return;
      }

      if (!selectorRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  return {
    selectorRef,
    query,
    onQueryChange,
    isDropdownOpen,
    selectedMemberIds,
    selectedMembers,
    filteredMembers,
    toggleMember,
    removeMember,
    onSelectorAreaClick,
    onInviteInputFocus,
  };
}
