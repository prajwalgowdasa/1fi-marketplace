export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export async function requestJson<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { accept: "application/json", ...init.headers },
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiClientError(response.status, "INVALID_RESPONSE", "The server returned an invalid response.");
  }

  if (!response.ok) {
    const error = body as ErrorResponse;
    throw new ApiClientError(
      response.status,
      error.error?.code ?? "REQUEST_FAILED",
      error.error?.message ?? "We couldn’t complete that request.",
    );
  }

  return body as T;
}
