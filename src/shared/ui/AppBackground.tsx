import type { ReactNode } from "react";

type AppBackgroundProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function AppBackground({
  children,
  className = "",
  contentClassName = "",
}: AppBackgroundProps) {
  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-(--pm-bg) pm-text-primary ${className}`.trim()}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,var(--pm-bg-radial-1),transparent_34%),radial-gradient(circle_at_80%_20%,var(--pm-bg-radial-2),transparent_40%),radial-gradient(circle_at_50%_85%,var(--pm-bg-radial-3),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--pm-bg-linear-top),var(--pm-bg-linear-bottom))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--pm-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--pm-grid-line)_1px,transparent_1px)] bg-size-[36px_36px] opacity-40" />

      <div className={`relative z-10 flex min-h-screen flex-col ${contentClassName}`.trim()}>
        {children}
      </div>
    </div>
  );
}
