import type { ReactNode } from "react";
import { Typography } from "@promentorapp/ui-kit";

type PageForShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  containerClassName?: string;
};

export default function PageForShell({
  title,
  description,
  children,
  containerClassName = "mx-auto max-w-7xl",
}: PageForShellProps) {
  return (
    <main className="min-h-screen text-slate-100">
      <div className={containerClassName}>
        <section className="rounded-2xl border border-white/10 bg-slate-900/45 p-6 shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_12px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <Typography
            component="h1"
            variantStyle="title"
            className="text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl"
          >
            {title}
          </Typography>
          <Typography
            component="p"
            variantStyle="body"
            className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base"
          >
            {description}
          </Typography>
        </section>
        {children}
      </div>
    </main>
  );
}

