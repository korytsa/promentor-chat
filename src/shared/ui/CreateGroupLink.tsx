import { MdOutlineGroups } from "react-icons/md";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type CreateGroupLinkProps = {
  className?: string;
  children?: ReactNode;
  variant?: "empty" | "sidebar";
  onClick?: () => void;
};

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-[#e7f0ff] transition hover:border-white/30";

const variantClassName: Record<NonNullable<CreateGroupLinkProps["variant"]>, string> = {
  empty: "w-full hover:bg-white/10 md:w-[280px]",
  sidebar: "w-full hover:bg-white/10",
};

export function CreateGroupLink({
  className,
  children = "Create Group",
  variant = "sidebar",
  onClick,
}: CreateGroupLinkProps) {
  return (
    <Link
      to="/chat/create-group"
      onClick={onClick}
      className={[baseClassName, variantClassName[variant], className ?? ""].join(" ")}
    >
      <MdOutlineGroups className="shrink-0 text-lg" aria-hidden />
      {children}
    </Link>
  );
}
