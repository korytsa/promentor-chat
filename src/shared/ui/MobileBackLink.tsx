import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";

type MobileBackLinkProps = {
  to?: string;
  ariaLabel?: string;
  className?: string;
};

export function MobileBackLink({
  to = "/",
  ariaLabel = "Back to chats",
  className,
}: MobileBackLinkProps) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={["inline-flex items-center justify-center md:hidden", className ?? ""]
        .join(" ")
        .trim()}
    >
      <IoIosArrowBack className="text-xl" />
    </Link>
  );
}
