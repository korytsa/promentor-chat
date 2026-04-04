import { IoIosImages, IoIosPaperPlane } from "react-icons/io";
import { MdEmojiEmotions } from "react-icons/md";
import { Button, TextField } from "@promentorapp/ui-kit";

export function ChatCompose() {
  return (
    <form className="border-t border-white/20 p-4">
      <div className="flex items-center gap-3 rounded-lg ">
        <Button
          type="button"
          aria-label="Attach image"
          isIconOnly
          variant="contained"
        >
          <IoIosImages className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          aria-label="Attach emoji"
          isIconOnly
          variant="contained"
        >
          <MdEmojiEmotions className="h-5 w-5" />
        </Button>

        <div className="flex-1 [&>label]:gap-0 [&>label>p]:sr-only">
          <TextField
            label="Message"
            type="text"
            size="sm"
            placeholder="Type your message..."
            className="border-none! bg-transparent! outline-none! focus:ring-0!"
          />
        </div>
        <Button
          type="button"
          aria-label="Send message"
          isIconOnly
          variant="contained"
        >
          <IoIosPaperPlane className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
