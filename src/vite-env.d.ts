/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_CHAT_SOCKET_URL?: string;
  readonly VITE_SHELL_REMOTE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "shell/authBridge" {
  export type AuthRole = "MENTOR" | "REGULAR_USER";

  export type AuthUser = {
    id: string;
    email: string;
    fullName: string;
    role: AuthRole;
    avatarUrl?: string | null;
    jobTitle?: string | null;
    about?: string | null;
  };

  export type AuthSession = {
    isAuthenticated: boolean;
    user: AuthUser | null;
  };

  export const authBridge: {
    getSession: () => AuthSession;
    subscribe: (listener: (session: AuthSession) => void) => () => void;
    setSession: (user: AuthUser | null) => void;
    logout: () => Promise<void>;
  };
}
