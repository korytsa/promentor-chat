import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { CONVERSATIONS, SEARCH_USERS } from "../../../entities/chat";

export function useChatSidebarModel() {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const q = query.trim().toLowerCase();
  const filteredUsers = SEARCH_USERS.filter((user) => user.name.toLowerCase().includes(q));

  const directMessages = CONVERSATIONS.filter((conversation) => conversation.category === "direct");
  const groupMessages = CONVERSATIONS.filter((conversation) => conversation.category === "group");

  const categoryClassName = "mb-1 text-[12px] font-bold text-white/50";
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
  }, []);

  return {
    search: {
      query,
      setQuery,
      isOpen,
      setIsOpen,
      containerRef,
      filteredUsers,
    },
    directMessages,
    groupMessages,
    categoryClassName,
    visibilityClassName,
  };
}
