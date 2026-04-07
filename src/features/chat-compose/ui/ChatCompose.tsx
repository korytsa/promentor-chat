import { IoIosImages, IoIosPaperPlane } from "react-icons/io";
import { MdEmojiEmotions } from "react-icons/md";
import { Button, TextField } from "@promentorapp/ui-kit";

const iconButtonClassName = "h-8! min-h-8! w-8! min-w-8! p-0! sm:h-10! sm:min-h-10! sm:w-10! sm:min-w-10! p-0!";
const iconClassName = "size-5 text-[#e7f0ff]";

export function ChatCompose() {
  return (
    <form className="border-t border-white/20 p-2 sm:p-4">
      <div className="flex items-center gap-3 rounded-lg ">
        <Button
          type="button"
          aria-label="Attach image"
          variant="contained"
          className={iconButtonClassName}
        >
          <IoIosImages className={iconClassName} />
        </Button>
        <Button
          type="button"
          aria-label="Attach emoji"
          variant="contained"
          className={iconButtonClassName}
        >
          <MdEmojiEmotions className={iconClassName} />
        </Button>

        <div className="flex-1 [&>label]:gap-0 [&>label>p]:sr-only">
          <TextField
            label="Message"
            aria-label="Message"
            name="message"
            type="text"
            size="sm"
            placeholder="Type your message..."
            className="border-none! pl-0! sm:pl-1! bg-transparent! outline-none! focus:ring-0!"
          />
        </div>
        <Button
          type="button"
          aria-label="Send message"
          variant="contained"
          className={iconButtonClassName}
        >
          <IoIosPaperPlane className={iconClassName} />
        </Button>
      </div>
    </form>
  );
}
