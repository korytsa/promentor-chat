import { useEffect, useRef, useState } from "react";
import { SEARCH_USERS } from "../../../entities/chat";

export function useConversationSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const q = query.trim().toLowerCase();
  const filteredUsers = SEARCH_USERS.filter((user) => user.name.toLowerCase().includes(q));

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
    query,
    setQuery,
    isOpen,
    setIsOpen,
    containerRef,
    filteredUsers,
  };
}
