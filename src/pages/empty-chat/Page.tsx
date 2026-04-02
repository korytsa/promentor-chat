import { CreateGroupLink } from "../../shared/ui/CreateGroupLink";

export default function ChatEmptyPage() {
    return (
      <section className="flex flex-1 flex-col items-center justify-center rounded-r-lg border border-white/20">
      <h2 className="text-3xl font-semibold tracking-tight text-[#eff5ff] sm:text-3xl">
        Select Chat
      </h2>
      <p className="mt-3 max-w-lg text-center tracking-wide text-[#9bb4df]">
        Choose a conversation from the left sidebar to start messaging. Want a one-to-one chat, or create a group for your team?
      </p>
      <CreateGroupLink variant="empty" />
  </section>
    );
  }