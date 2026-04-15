import type { ReactNode } from "react";
import { Typography } from "@promentorapp/ui-kit";
import {
  AUTH_SESSION_HYDRATING_TEXT,
  AUTH_SESSION_HYDRATING_TITLE,
  AUTH_SESSION_ENDED_DESCRIPTION,
  AUTH_SESSION_ENDED_TITLE,
  AUTH_SESSION_WAITING_TEXT,
  useHostAuthSession,
} from "../shared/auth/index";

type AuthSessionBoundaryProps = {
  children: ReactNode;
};

type AuthStatePageProps = {
  title: string;
  description: string;
  message: string;
  messageClassName: string;
};

function AuthStatePage({ title, description, message, messageClassName }: AuthStatePageProps) {
  return (
    <main className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl">
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
        <div className={messageClassName}>
          <Typography component="p" variantStyle="body">
            {message}
          </Typography>
        </div>
      </div>
    </main>
  );
}

export default function AuthSessionBoundary({ children }: AuthSessionBoundaryProps) {
  const { session, isBridgeAvailable, isHydrating } = useHostAuthSession();
  const showGuestState = isBridgeAvailable && !session.isAuthenticated;

  if (isHydrating) {
    return (
      <AuthStatePage
        title={AUTH_SESSION_HYDRATING_TITLE}
        description={AUTH_SESSION_HYDRATING_TEXT}
        message={AUTH_SESSION_HYDRATING_TEXT}
        messageClassName="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm text-cyan-100"
      />
    );
  }

  if (!showGuestState) {
    return children;
  }

  return (
    <AuthStatePage
      title={AUTH_SESSION_ENDED_TITLE}
      description={AUTH_SESSION_ENDED_DESCRIPTION}
      message={AUTH_SESSION_WAITING_TEXT}
      messageClassName="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100"
    />
  );
}
