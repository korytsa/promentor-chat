import { Route, Routes } from "react-router-dom";
import ChatPage from "../pages/chat";

export default function App() {
  return (
      <div className="min-h-screen bg-slate-900 pt-10">
        <Routes>
          <Route path="/" element={<ChatPage />} />
        </Routes>
      </div>
  );
}
