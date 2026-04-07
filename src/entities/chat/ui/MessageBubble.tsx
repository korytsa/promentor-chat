import { Typography, Avatar } from "@promentorapp/ui-kit";
import type { ChatMessage } from "../model/types";

type MessageBubbleProps = {
  message: ChatMessage;
  resolveProfilePath?: (authorProfileSlug: string) => string;
};

export function MessageBubble({ message, resolveProfilePath }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const slug = message.authorProfileSlug;
  const profileTo = slug && resolveProfilePath ? resolveProfilePath(slug) : undefined;

  if (isUser) {
    return (
      <div className="ml-auto max-w-[70%]">
        <div className="mb-1 flex items-baseline justify-end gap-2">
          <Typography component="span" className="text-xs">
            {message.time}
          </Typography>
          <Typography component="span" className="text-sm">
            {message.author}
          </Typography>
        </div>

        <div className="flex items-start justify-end">
          <div className="rounded-lg border border-blue-500 px-4 py-3 shadow-[0_6px_18px_rgba(10,45,108,0.38)]">
            <Typography component="p" variantStyle="caption" className="text-sm sm:text-base">
              {message.text}
            </Typography>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-end gap-1">
          <Typography component="span" className="text-xs">
            ✓✓ Read
          </Typography>
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
          <Typography component="p" variantStyle="subtitle">
            {message.author}
          </Typography>
          <Typography component="span" variantStyle="caption" className="text-xs">
            {message.time}
          </Typography>
        </div>

        <div className="rounded-lg border border-white/20 p-3 shadow-[inset_0_0_0_1px_rgba(147,193,255,0.1)]">
          <Typography component="p" variantStyle="caption" className="text-sm sm:text-base">
            {message.text}
          </Typography>
        </div>
      </div>
    </div>
  );
}
