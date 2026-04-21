import { io, type Socket } from "socket.io-client";
import { getChatSocketUrl } from "./chatSocketConfig";

let socket: Socket | null = null;

export function getOrCreateChatSocket(): Socket | null {
  const url = getChatSocketUrl();
  if (!url) {
    return null;
  }
  if (!socket) {
    socket = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function resetChatSocket(): void {
  if (!socket) {
    return;
  }
  socket.disconnect();
  socket = null;
}
