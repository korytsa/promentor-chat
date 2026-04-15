/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
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
