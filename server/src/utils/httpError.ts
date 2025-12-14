export type HttpError = {
  status: number;
  message: string;
};

export function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

export function httpError(status: number, message: string): HttpError {
  return { status, message };
}
