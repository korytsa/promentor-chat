import { Outlet } from "react-router-dom";
import { CONVERSATIONS } from "../../entities/chat";
import { ChatSidebar } from "./ChatSidebar";

export function ChatLayout() {
  return (
    <main className="mx-auto flex min-h-0 flex-1 w-full max-w-7xl flex-row">
      <ChatSidebar conversations={CONVERSATIONS} />
      <Outlet />
    </main>
  );
}
