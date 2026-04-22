import type { ReactNode } from "react";
import { Typography } from "@promentorapp/ui-kit";
import {
  AUTH_SESSION_HYDRATING_TEXT,
  AUTH_SESSION_WAITING_TEXT,
  useHostAuthSession,
} from "../features/auth";

export default function AuthSessionBoundary({ children }: { children: ReactNode }) {
  const { session, isBridgeAvailable, isHydrating } = useHostAuthSession();
  const showGuestState = isBridgeAvailable && !session.isAuthenticated;

  if (isHydrating) {
    return (
      <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm text-cyan-100">
        <Typography component="p" variantStyle="body" className="text-cyan-100">
          {AUTH_SESSION_HYDRATING_TEXT}
        </Typography>
      </div>
    );
  }

  if (!showGuestState) {
    return children;
  }

  return (
    <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
      <Typography component="p" variantStyle="body" className="text-amber-100">
        {AUTH_SESSION_WAITING_TEXT}
      </Typography>
    </div>
  );
}
