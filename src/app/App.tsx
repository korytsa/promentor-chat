import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "../pages/chat";
import CreateGroupPage from "../pages/create-group";
import { AppBackground } from "../shared/ui/AppBackground";
import ChatEmptyPage from "../pages/empty-chat/ui/Page";
import { ChatSidebar } from "../widgets";

export default function App() {
  return (
    <AppBackground contentClassName="md:px-6 md:py-6">
      <main className="mx-auto flex min-h-0 flex-1 w-full max-w-7xl gap-2 flex-row">
        <ChatSidebar />
        <Routes>
          <Route path="/" element={<ChatEmptyPage />} />
          <Route path="/chat" element={<ChatEmptyPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/chat/create-group" element={<CreateGroupPage />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </main>
    </AppBackground>
  );
}
