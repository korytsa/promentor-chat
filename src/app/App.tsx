import { Route, Routes } from "react-router-dom";
import ChatPage from "../pages/chat";
import CreateGroupPage from "../pages/create-group";
import ProfilePage from "../pages/profile";
import { AppBackground } from "../shared/ui/AppBackground";
import { ChatLayout } from "../widgets";
import { ChatEmptyPage } from "../pages/chat/ui/Page";

export default function App() {
  return (
    <AppBackground contentClassName="px-3 py-4 md:px-6 md:py-6">
      <div className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<ChatLayout />}>
            <Route index element={<ChatEmptyPage />} />
            <Route path="chat/:chatId" element={<ChatPage />} />
            <Route path="create-group" element={<CreateGroupPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:slug" element={<ProfilePage />} />
          </Route>
        </Routes>
      </div>
    </AppBackground>
  );
}
