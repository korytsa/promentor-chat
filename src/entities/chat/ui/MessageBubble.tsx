import { Avatar } from "../../../shared/ui/Avatar";
import type { ChatMessage } from "../model/types";

type MessageBubbleProps = {
  message: ChatMessage;
  resolveProfilePath?: (authorProfileSlug: string) => string;
};

export function MessageBubble({ message, resolveProfilePath }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const slug = message.authorProfileSlug;
  const profileTo =
    slug && resolveProfilePath ? resolveProfilePath(slug) : undefined;

  if (isUser) {
    return (
      <div className="ml-auto max-w-[70%]">
        <div className="mb-1 flex items-baseline justify-end gap-2">
          <span className="text-[11px] text-[#8ea9d9]">{message.time}</span>
          <p className="text-sm font-semibold text-[#f8fbff]">{message.author}</p>
        </div>

        <div className="flex items-start justify-end">
          <div className="rounded-lg border border-blue-500 px-4 py-3 text-sm leading-relaxed text-[#eef5ff] shadow-[0_6px_18px_rgba(10,45,108,0.38)]">
            <p>{message.text}</p>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[#8fb4ee]">
          <span aria-hidden>✓✓</span>
          <span>Read</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-[min(85%,42rem)] items-start gap-3">
      <Avatar
        user={{ name: message.author, avatarUrl: message.avatarUrl }}
        size="sm"
        href={profileTo}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm leading-0 font-semibold text-[#f1f6ff]">{message.author}</p>
          <span className="shrink-0 text-[11px] text-[#92acda]">{message.time}</span>
        </div>

        <div className="rounded-lg border border-white/20 p-3 text-sm text-[#e8f1ff] shadow-[inset_0_0_0_1px_rgba(147,193,255,0.1)]">
          <p>{message.text}</p>
        </div>
      </div>
    </div>
  );
}
