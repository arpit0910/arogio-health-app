export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type AccessTokenProvider = () => Promise<string | null>;
export type RequestOptions = {
  path: string;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type ErrorBody = {
  message?: string | string[];
  code?: string;
  error?: {
    message?: string | string[];
    code?: string;
    details?: unknown;
  } | string;
};

function parseErrorMessage(payload: unknown, defaultMessage: string): { message: string; code?: string; details?: unknown } {
  if (typeof payload === 'object' && payload !== null) {
    const p = payload as ErrorBody;
    const nested = typeof p.error === 'object' && p.error !== null ? p.error : undefined;
    const rawMsg = nested?.message ?? p.message ?? (typeof p.error === 'string' ? p.error : undefined);
    const code = nested?.code ?? p.code;
    const details = nested?.details;

    if (Array.isArray(rawMsg)) {
      return { message: rawMsg.join('\n'), code, details };
    }
    if (typeof rawMsg === 'string' && rawMsg.trim().length > 0) {
      return { message: rawMsg, code, details };
    }
  }
  return { message: defaultMessage };
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly getAccessToken: AccessTokenProvider;
  private readonly timeoutMs: number;

  constructor(
    baseUrl: string,
    getAccessToken: AccessTokenProvider,
    timeoutMs = 15_000,
  ) {
    this.baseUrl = baseUrl;
    this.getAccessToken = getAccessToken;
    this.timeoutMs = timeoutMs;
  }

  async request<T>({ path, method = 'GET', body, headers, signal }: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const abortRequest = () => controller.abort();
    signal?.addEventListener('abort', abortRequest, { once: true });
    const timeout = setTimeout(abortRequest, this.timeoutMs);
    try {
      const token = await this.getAccessToken();
      const response = await fetch(this.getUrl(path), {
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const payload = await this.readBody(response);
      if (!response.ok) {
        const { message, code, details } = parseErrorMessage(payload, `Request failed with status ${response.status}.`);
        throw new ApiError(message, response.status, code, details);
      }
      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (controller.signal.aborted) throw new ApiError('The request timed out.', 408);
      const networkMsg = error instanceof Error && error.message ? error.message : 'Unable to reach Arogio Health. Please check your connection.';
      throw new ApiError(networkMsg, 0);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abortRequest);
    }
  }

  private getUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`;
  }

  private async readBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';
    if (response.status === 204) return undefined;
    if (!contentType.includes('application/json')) {
      if (response.ok) {
        throw new ApiError('The API is not available right now. Please try again later.', 502, 'INVALID_API_RESPONSE');
      }
      return undefined;
    }
    try {
      return await response.json();
    } catch {
      throw new ApiError('The API returned an invalid response. Please try again later.', 502, 'INVALID_API_RESPONSE');
    }
  }
}
