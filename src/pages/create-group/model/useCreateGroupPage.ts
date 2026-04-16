import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchUser } from "../../../entities/chat";
import { mapUserSearchDtoToSearchUser } from "../../../entities/chat/model/mapUserSearchDto";
import { useHostAuthSession } from "../../../features/auth";
import { createRoom, parseApiFailure } from "../../../shared/api";
import { USER_SEARCH_DEBOUNCE_MS, USER_SEARCH_MIN_QUERY_LEN } from "../../../shared/lib/constants/userSearch";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue";
import { useUserSearch } from "../../../shared/lib/useUserSearch";
import {
  CREATE_GROUP_CREATE_FAILURE,
  CREATE_GROUP_SEARCH_FAILURE,
  CREATE_GROUP_PAGE_COPY,
} from "./constants";

export type CreateGroupPageViewModel = {
  selectorRef: RefObject<HTMLDivElement | null>;
  groupName: string;
  onGroupNameChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  isDropdownOpen: boolean;
  selectedMemberIds: string[];
  selectedMembers: SearchUser[];
  filteredMembers: SearchUser[];
  searchLoading: boolean;
  searchError: string | null;
  submitBusy: boolean;
  submitError: string | null;
  onSubmit: () => void;
  toggleMember: (memberId: string) => void;
  removeMember: (memberId: string) => void;
  onSelectorAreaClick: () => void;
  onInviteInputFocus: () => void;
};

export function useCreateGroupPage(): CreateGroupPageViewModel {
  const { session } = useHostAuthSession();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<SearchUser[]>([]);
  const selectedMembersRef = useRef<SearchUser[]>([]);
  useLayoutEffect(() => {
    selectedMembersRef.current = selectedMembers;
  }, [selectedMembers]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, USER_SEARCH_DEBOUNCE_MS);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  const { dtos, loading: searchLoading, error: searchError, active: searchActive } = useUserSearch({
    debouncedQuery,
    minQueryLength: USER_SEARCH_MIN_QUERY_LEN,
    parseFailure: CREATE_GROUP_SEARCH_FAILURE,
    excludeUserId: session.user?.id,
  });

  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const searchResults = useMemo(
    () => (searchActive ? dtos.map(mapUserSearchDtoToSearchUser) : []),
    [searchActive, dtos],
  );

  const selectedMemberIds = useMemo(() => selectedMembers.map((m) => m.id), [selectedMembers]);
  const selectedIdSet = useMemo(() => new Set(selectedMemberIds), [selectedMemberIds]);

  const filteredMembers = useMemo(() => {
    const pool = searchActive ? searchResults : [];
    return pool.filter((m) => !selectedIdSet.has(m.id));
  }, [searchActive, searchResults, selectedIdSet]);

  const clearInviteWhenLastRemoved = (next: SearchUser[], previous: SearchUser[]) => {
    if (next.length === 0 && previous.length > 0) {
      setIsDropdownOpen(false);
      setQuery("");
    }
  };

  const toggleMember = (memberId: string) => {
    const current = selectedMembersRef.current;
    const exists = current.some((m) => m.id === memberId);
    if (exists) {
      const next = current.filter((m) => m.id !== memberId);
      setSelectedMembers(next);
      clearInviteWhenLastRemoved(next, current);
      return;
    }

    const row = searchResults.find((m) => m.id === memberId);
    if (!row) {
      return;
    }

    setSelectedMembers([...current, row]);
  };

  const removeMember = (memberId: string) => {
    const current = selectedMembersRef.current;
    const next = current.filter((m) => m.id !== memberId);
    setSelectedMembers(next);
    clearInviteWhenLastRemoved(next, current);
  };

  const openInviteDropdown = useCallback(() => setIsDropdownOpen(true), []);

  const onQueryChange = (value: string) => {
    setQuery(value);
    setIsDropdownOpen(true);
  };

  const onSubmit = useCallback(async () => {
    const name = groupName.trim();
    if (!name || selectedMembers.length === 0) {
      setSubmitError(CREATE_GROUP_PAGE_COPY.validationHint);
      return;
    }

    setSubmitBusy(true);
    setSubmitError(null);
    try {
      const room = await createRoom({
        type: "group",
        name,
        memberIds: selectedMembers.map((m) => m.id),
      });
      navigate(`/chat/${room.id}`);
    } catch (err: unknown) {
      setSubmitError(parseApiFailure(err, CREATE_GROUP_CREATE_FAILURE));
    } finally {
      setSubmitBusy(false);
    }
  }, [groupName, navigate, selectedMembers]);

  useLayoutEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  return {
    selectorRef,
    groupName,
    onGroupNameChange: setGroupName,
    query,
    onQueryChange,
    isDropdownOpen,
    selectedMemberIds,
    selectedMembers,
    filteredMembers,
    searchLoading,
    searchError,
    submitBusy,
    submitError,
    onSubmit,
    toggleMember,
    removeMember,
    onSelectorAreaClick: openInviteDropdown,
    onInviteInputFocus: openInviteDropdown,
  };
}
