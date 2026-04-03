import { CreateGroupLink } from "../../../shared/ui/CreateGroupLink";
import { Typography } from "@promentorapp/ui-kit";

export default function ChatEmptyPage() {
  return (
    <section className="flex flex-1 flex-col gap-3 items-center justify-center rounded-r-lg border border-white/20">
      <Typography variant="h3">Select Chat</Typography>
      <Typography variantStyle="caption" className="max-w-lg text-center">
        Choose a conversation from the left sidebar to start messaging. Want a one-to-one chat, or
        create a group for your team?
      </Typography>
      <CreateGroupLink variant="empty" />
    </section>
  );
}
