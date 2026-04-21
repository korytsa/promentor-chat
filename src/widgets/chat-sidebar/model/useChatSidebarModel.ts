import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SIDEBAR_CONVERSATION_CATEGORY_CLASS } from "./constants";
import { useDmOpenOrCreate } from "./useDmOpenOrCreate";
import { useGlobalUserSearch } from "./useGlobalUserSearch";
import { useRoomsList } from "./useRoomsList";

type UseChatSidebarModelOptions = {
  excludeUserId?: string;
};

export function useChatSidebarModel(options?: UseChatSidebarModelOptions) {
  const excludeUserId = options?.excludeUserId;
  const location = useLocation();
  const { status, errorMessage, directMessages, groupMessages, conversations } = useRoomsList();
  const searchState = useGlobalUserSearch({ conversations, excludeUserId });
  const { onSelectSearchOption } = useDmOpenOrCreate({ setDmCreateError: searchState.setDmCreateError });
  const { containerRef, setIsOpen } = searchState;

  const isListRoute = location.pathname === "/" || location.pathname === "/chat";
  const visibilityClassName = isListRoute ? "flex md:flex" : "hidden md:flex";

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [containerRef, setIsOpen]);

  return {
    search: {
      query: searchState.query,
      setQuery: searchState.setQuery,
      isOpen: searchState.isOpen,
      setIsOpen: searchState.setIsOpen,
      containerRef: searchState.containerRef,
      filteredUsers: searchState.filteredUsers,
      onSelectSearchOption,
      userSearchLoading: searchState.userSearchLoading,
      userSearchError: searchState.userSearchError,
      directoryLoading: searchState.directoryLoading,
      directoryError: searchState.directoryError,
      dmCreateError: searchState.dmCreateError,
    },
    directMessages,
    groupMessages,
    categoryClassName: SIDEBAR_CONVERSATION_CATEGORY_CLASS,
    visibilityClassName,
    status,
    errorMessage,
  };
}
