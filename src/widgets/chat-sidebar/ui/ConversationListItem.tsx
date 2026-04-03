import { Typography } from "@promentorapp/ui-kit";
import { NavLink } from "react-router-dom";
import type { Conversation } from "../../../entities/chat";
import { ConversationAvatar } from "./ConversationAvatar";

type Props = {
  conversation: Conversation;
};

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "w-full rounded-lg border px-2 py-1 transition",
    isActive
      ? "border-white/20 bg-white/10"
      : "border-white/20 hover:border-white/30 hover:bg-white/10",
  ].join(" ");

export function ConversationListItem({ conversation }: Props) {
  return (
    <NavLink to={`/chat/${conversation.id}`} className={navLinkClassName}>
      <div className="flex items-center gap-3">
        <ConversationAvatar conversation={conversation} />
        <div>
          <Typography component="p" variantStyle="subtitle" className="text-sm!">
            {conversation.title}
          </Typography>
          <Typography component="p" variantStyle="caption" className="text-xs!">
            {conversation.updatedAt}
          </Typography>
        </div>
      </div>
    </NavLink>
  );
}
