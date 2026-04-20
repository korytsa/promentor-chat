/// <reference types="vite/client" />

declare module "shell/authBridge" {
  export type AuthRole = "MENTOR" | "REGULAR_USER";

  export type AuthUser = {
    id: string;
    email: string;
    fullName: string;
    role: AuthRole;
    avatarUrl?: string | null;
  };

  export type AuthSession = {
    isAuthenticated: boolean;
    user: AuthUser | null;
  };

  export const authBridge: {
    getSession: () => AuthSession;
    subscribe: (listener: (session: AuthSession) => void) => () => void;
    logout: () => Promise<void>;
  };
}
