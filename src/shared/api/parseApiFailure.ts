import { ApiError } from "./error";

type ParseOptions = {
  fallback: string;
  unauthorized?: string;
  notFound?: string;
};

export function parseApiFailure(err: unknown, options: ParseOptions): string {
  if (err instanceof ApiError) {
    if (err.status === 401 && options.unauthorized !== undefined) {
      return options.unauthorized;
    }
    if (err.status === 404 && options.notFound !== undefined) {
      return options.notFound;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return options.fallback;
}
