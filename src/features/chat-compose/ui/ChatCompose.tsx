import { type FormEvent, useState } from "react";
import { IoIosPaperPlane } from "react-icons/io";
import { Button, TextField } from "@promentorapp/ui-kit";
import { CHAT_MESSAGE_MAX_LENGTH } from "../model/constants";

const iconButtonClassName =
  "h-8 min-h-8 w-8 min-w-8 p-0 sm:h-10 sm:min-h-10 sm:w-10 sm:min-w-10 p-0";
const iconClassName = "size-5 text-[#e7f0ff]";

type ChatComposeProps = {
  onSend: (text: string) => void | Promise<void>;
  disabled?: boolean;
  isSending?: boolean;
  sendError?: string | null;
  typingHint?: string | null;
  onTypingActivity?: () => void;
};

export function ChatCompose({
  onSend,
  disabled,
  isSending,
  sendError,
  typingHint,
  onTypingActivity,
}: ChatComposeProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (!text || disabled || isSending) {
      return;
    }
    if (text.length > CHAT_MESSAGE_MAX_LENGTH) {
      return;
    }
    void Promise.resolve(onSend(text))
      .then(() => setValue(""))
      .catch(() => {});
  };

  const isBusy = Boolean(disabled || isSending);

  return (
    <form className="border-t border-white/20 p-2 sm:p-4" onSubmit={handleSubmit}>
      {sendError ? (
        <p className="mb-2 text-xs text-red-300" role="alert">
          {sendError}
        </p>
      ) : null}
      <div className="mb-1 h-4">
        {typingHint ? <p className="text-xs text-white/55">{typingHint}</p> : null}
      </div>
      <div className="flex items-center gap-3 rounded-lg ">
        <div className="flex-1 [&>label]:gap-0 [&>label>p]:sr-only">
          <TextField
            label="Message"
            aria-label="Message"
            name="message"
            type="text"
            size="sm"
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              if (next.length <= CHAT_MESSAGE_MAX_LENGTH) {
                setValue(next);
                onTypingActivity?.();
              }
            }}
            placeholder="Type your message..."
            className="border-none pl-0 sm:pl-1 bg-transparent outline-none focus:ring-0"
            disabled={isBusy}
          />
        </div>
        <Button
          type="submit"
          aria-label="Send message"
          variant="contained"
          className={iconButtonClassName}
          disabled={isBusy || !value.trim()}
        >
          <IoIosPaperPlane className={iconClassName} />
        </Button>
      </div>
    </form>
  );
}
