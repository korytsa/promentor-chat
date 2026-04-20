import { useEffect, useRef, useState } from "react";
import type { HostAuthBridge, HostAuthSession } from "./types";
import {
  AuthHttpError,
  fetchCurrentUser,
  normalizeCurrentUser,
  type CurrentUser,
} from "../../../shared/api/current-user";

const fallbackSession: HostAuthSession = {
  isAuthenticated: false,
  user: null,
};

const STANDALONE_AUTH_MAX_ATTEMPTS = 3;
const STANDALONE_AUTH_BASE_DELAY_MS = 400;
const STANDALONE_AUTH_429_MIN_DELAY_MS = 2_500;

type LoadFallbackResult = { ok: true; session: HostAuthSession } | { ok: false };

function isRetryableStandaloneAuthError(error: unknown): boolean {
  if (error instanceof AuthHttpError) {
    if (error.status === 401) {
      return false;
    }
    if (error.status === 0 || error.status === 429) {
      return true;
    }
    return error.status >= 500 && error.status < 600;
  }
  return false;
}

function getStandaloneAuthRetryDelayMs(error: unknown, attempt: number): number {
  const base = STANDALONE_AUTH_BASE_DELAY_MS * (attempt + 1);
  if (error instanceof AuthHttpError && error.status === 429) {
    return Math.max(base * 3, STANDALONE_AUTH_429_MIN_DELAY_MS);
  }
  return base;
}

async function loadFallbackSession(): Promise<LoadFallbackResult> {
  const runAttempt = async (attempt: number): Promise<LoadFallbackResult> => {
    try {
      const profile = await fetchCurrentUser();
      return {
        ok: true,
        session: { isAuthenticated: true, user: profile },
      };
    } catch (error) {
      if (error instanceof AuthHttpError && error.status === 401) {
        return { ok: true, session: fallbackSession };
      }

      const canRetry =
        attempt < STANDALONE_AUTH_MAX_ATTEMPTS - 1 && isRetryableStandaloneAuthError(error);
      if (canRetry) {
        await new Promise((resolve) =>
          setTimeout(resolve, getStandaloneAuthRetryDelayMs(error, attempt)),
        );
        return runAttempt(attempt + 1);
      }

      return { ok: false };
    }
  };

  return runAttempt(0);
}

function normalizeSessionUser(session: HostAuthSession): HostAuthSession {
  if (!session.user) {
    return session;
  }
  const normalized = normalizeCurrentUser(session.user as CurrentUser);
  return { ...session, user: normalized ?? session.user };
}

let bridgeLoadPromise: Promise<HostAuthBridge | null> | null = null;

async function loadHostAuthBridge(): Promise<HostAuthBridge | null> {
  if (!bridgeLoadPromise) {
    bridgeLoadPromise = import("shell/authBridge")
      .then((module) => {
        const mod = module as {
          authBridge?: HostAuthBridge;
          default?: HostAuthBridge | { authBridge?: HostAuthBridge };
        };
        const candidate =
          mod.authBridge ??
          (typeof mod.default === "object" && mod.default !== null
            ? "authBridge" in mod.default
              ? (mod.default.authBridge ?? null)
              : (mod.default as HostAuthBridge)
            : null);

        if (candidate) {
          return candidate;
        }
        return null;
      })
      .catch(() => {
        bridgeLoadPromise = null;
        return null;
      });
  }

  return bridgeLoadPromise;
}

export function useHostAuthSession() {
  const [session, setSession] = useState<HostAuthSession>(fallbackSession);
  const [isBridgeAvailable, setIsBridgeAvailable] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    void loadHostAuthBridge().then((bridge) => {
      if (!mountedRef.current) {
        return;
      }

      if (bridge) {
        setIsBridgeAvailable(true);
        setSession(normalizeSessionUser(bridge.getSession()));
        unsubscribe = bridge.subscribe((next) => {
          setSession(normalizeSessionUser(next));
        });
        setIsHydrating(false);
        return;
      }

      void loadFallbackSession().then((result) => {
        if (!mountedRef.current) {
          return;
        }
        if (result.ok) {
          setSession(result.session);
        }
        setIsHydrating(false);
      });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { session, isBridgeAvailable, isHydrating };
}
