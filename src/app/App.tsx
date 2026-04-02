import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "../pages/chat";
import CreateGroupPage from "../pages/create-group";
import ProfilePage from "../pages/profile";
import { AppBackground } from "../shared/ui/AppBackground";
import ChatEmptyPage from "../pages/empty-chat/Page";
import { ChatSidebar } from "../widgets";

export default function App() {
  return (
    <AppBackground contentClassName="px-3 py-4 md:px-6 md:py-6">
      <main className="mx-auto flex min-h-0 flex-1 w-full max-w-7xl flex-row">
        <ChatSidebar />
        <Routes>
          <Route path="/" element={<ChatEmptyPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/chat/create-group" element={<CreateGroupPage />} />
          <Route path="/chat/profile" element={<ProfilePage />} />
          <Route path="/chat/profile/:slug" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </AppBackground>
  );
}
