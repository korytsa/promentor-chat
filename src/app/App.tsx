import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChatPage } from "../pages/chat";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
      <Routes>
        <Route path="/" element={<ChatPage />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}
