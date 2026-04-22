import { Typography } from "@promentorapp/ui-kit";
import { NavLink } from "react-router-dom";
import type { Conversation } from "../../../entities/chat";
import { ConversationAvatar } from "./ConversationAvatar";

type Props = {
  conversation: Conversation;
  onClick?: () => void;
};

export function ConversationListItem({ conversation, onClick }: Props) {
  const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
    [
      "w-full rounded-lg border px-2 py-1 transition",
      isActive
        ? "border-white/20 bg-white/10"
        : "border-white/20 hover:border-white/30 hover:bg-white/10",
    ].join(" ");

  return (
    <NavLink to={`/chat/${conversation.id}`} className={getNavLinkClassName} onClick={onClick}>
      <div className="flex items-center gap-3">
        <ConversationAvatar conversation={conversation} />
        <div>
          <Typography component="p" variantStyle="subtitle" className="text-sm">
            {conversation.title}
          </Typography>
          <Typography component="p" variantStyle="caption" className="text-xs">
            {conversation.updatedAt}
          </Typography>
        </div>
      </div>
    </NavLink>
  );
}
