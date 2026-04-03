import type { Conversation } from "../../../entities/chat";
import { Avatar } from "../../../shared/ui/Avatar";

type Props = {
  conversation: Conversation;
};

export function ConversationAvatar({ conversation }: Props) {
  if (conversation.category === "group") {
    return (
      <div className="flex">
        {conversation.avatarUrls.slice(0, 3).map((avatarUrl, index) => (
          <div
            key={avatarUrl}
            className={index === 0 ? "" : "-ml-3"}
          >
            <Avatar
              user={{ name: conversation.title, avatarUrl }}
              size="sm"
            />
          </div>
        ))}
      </div>
    );
  }

  const avatarUrl = conversation.avatarUrls[0];

  return (
    <Avatar user={{ name: conversation.title, avatarUrl }} size="sm" />
  );
}
