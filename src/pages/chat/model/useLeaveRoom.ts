import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseApiFailure, removeSelfFromRoom } from "../../../shared/api";
import { dispatchChatRoomsInvalidate } from "../../../shared/lib/chatRoomsInvalidate";
import { CHAT_LEAVE_ROOM_FAILURE } from "./constants";

export function useLeaveRoom(roomId: string | undefined, category: "direct" | "group" | undefined) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leave = useCallback(async () => {
    if (!roomId || !category) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await removeSelfFromRoom(roomId);
      dispatchChatRoomsInvalidate();
      navigate("/chat", { replace: true });
    } catch (err: unknown) {
      setError(parseApiFailure(err, CHAT_LEAVE_ROOM_FAILURE));
    } finally {
      setBusy(false);
    }
  }, [roomId, category, navigate]);

  return { leave, busy, error };
}
