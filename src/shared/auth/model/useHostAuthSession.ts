import { useEffect, useState } from "react";
import type { HostAuthBridge, HostAuthSession } from "./types";

const fallbackSession: HostAuthSession = {
  isAuthenticated: false,
  user: null,
};

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

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    void loadHostAuthBridge().then((bridge) => {
      if (!isMounted) {
        return;
      }

      if (bridge) {
        setIsBridgeAvailable(true);
        setSession(bridge.getSession());
        unsubscribe = bridge.subscribe((nextSession) => {
          setSession(nextSession);
        });
      }

      setIsHydrating(false);
    });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { session, isBridgeAvailable, isHydrating };
}

