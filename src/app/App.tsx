import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatPage from "../pages/chat";
import AuthSessionBoundary from "./AuthSessionBoundary";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 pt-10">
        <AuthSessionBoundary>
          <Routes>
            <Route path="/" element={<ChatPage />} />
          </Routes>
        </AuthSessionBoundary>
      </div>
    </BrowserRouter>
  );
}
