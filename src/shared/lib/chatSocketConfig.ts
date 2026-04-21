export function getChatSocketUrl(): string | null {
  const explicit = import.meta.env.VITE_CHAT_SOCKET_URL;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.replace(/\/+$/, "");
  }
  const api = import.meta.env.VITE_API_URL;
  if (typeof api === "string" && api.trim()) {
    return `${api.replace(/\/+$/, "")}/chat`;
  }
  return null;
}
