import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { ChatSearchOption, Conversation } from "../../../entities/chat";
import {
  mapRoomListItemToConversation,
  sortRoomsByUpdatedAtDesc,
} from "../../../entities/chat/model/mapRoomListItem";
import { ApiError, createRoom, fetchRooms, parseApiFailure } from "../../../shared/api";
import { dispatchChatRoomsInvalidate } from "../../../shared/lib/chatRoomsInvalidate";
import { CHAT_SEARCH_DM_FAILURE } from "../../../pages/chat/model/constants";
import { isSamePersonAsDirectRoom } from "./sidebarSearchUtils";

type Params = {
  setDmCreateError: (message: string | null) => void;
};

async function findExistingDirectConversation(
  option: ChatSearchOption,
): Promise<Conversation | null> {
  const rooms = await fetchRooms();
  const conversations: Conversation[] = sortRoomsByUpdatedAtDesc(rooms).map(
    mapRoomListItemToConversation,
  );
  const existingDm = conversations.find((c) =>
    isSamePersonAsDirectRoom(
      {
        id: c.id,
        name: c.title,
        avatarUrl: c.avatarUrls[0] ?? "",
        conversationCategory: c.category,
      },
      option,
    ),
  );
  return existingDm ?? null;
}

export function useDmOpenOrCreate({ setDmCreateError }: Params) {
  const navigate = useNavigate();

  const onSelectSearchOption = useCallback(
    async (option: ChatSearchOption): Promise<boolean> => {
      if (!option.isUserOnly) {
        navigate(`/chat/${option.id}`);
        return true;
      }

      try {
        const room = await createRoom({ type: "private", memberIds: [option.id] });
        dispatchChatRoomsInvalidate();
        navigate(`/chat/${room.id}`);
        return true;
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 400) {
          try {
            const existingDm = await findExistingDirectConversation(option);
            if (existingDm) {
              dispatchChatRoomsInvalidate();
              navigate(`/chat/${existingDm.id}`);
              return true;
            }
          } catch (lookupErr: unknown) {
            void lookupErr;
          }
        }
        setDmCreateError(parseApiFailure(err, CHAT_SEARCH_DM_FAILURE));
        return false;
      }
    },
    [navigate, setDmCreateError],
  );

  return { onSelectSearchOption };
}
