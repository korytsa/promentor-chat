import { IoIosImages, IoIosPaperPlane } from "react-icons/io";
import { MdEmojiEmotions } from "react-icons/md";

export function ChatCompose() {
  return (
    <form className="border-t border-white/20 p-4">
      <div className="flex items-center gap-3 rounded-lg ">
        <button
          type="button"
          aria-label="Attach image"
          className="grid shrink-0 cursor-pointer place-items-center rounded-lg p-2 text-[#a7bde8] bg-[#0a52c5]"
        >
          <IoIosImages className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Attach emoji"
          className="grid shrink-0 cursor-pointer place-items-center rounded-lg p-2 text-[#a7bde8] bg-[#0a52c5]"
        >
          <MdEmojiEmotions className="h-5 w-5" />
        </button>

        <input
          type="text"
          placeholder="Type your message..."
          className="w-full bg-transparent text-sm text-[#edf4ff] outline-none placeholder:text-[#87a2d4]"
        />
        <button
          type="button"
          aria-label="Send message"
          className="grid shrink-0 cursor-pointer place-items-center rounded-lg py-3 px-4 text-[#a7bde8] bg-[#0a52c5]"
        >
          <IoIosPaperPlane className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
