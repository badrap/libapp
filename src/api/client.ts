import * as v from "@badrap/valita";

const json = JSON.stringify;

export class HTTPError extends Error {
  constructor(
    readonly statusCode: number,
    readonly statusText: string,
  ) {
    super();

    this.name = "HTTPError";
  }

  get message() {
    return `HTTP status code ${this.statusCode}${this.statusText ? ` (${json(this.statusText)})` : ""}`;
  }
}

const APIErrorBody = v.object({
  error: v.object({
    code: v.string(),
    reason: v.string().optional(),
  }),
});

export class APIError extends HTTPError {
  constructor(
    statusCode: number,
    statusText: string,
    readonly errorCode: string,
    readonly errorReason?: string,
  ) {
    super(statusCode, statusText);

    this.name = "APIError";
  }

  get message() {
    return `API error code ${json(this.errorCode)}${this.errorReason ? `: ${this.errorReason}` : ""}`;
  }
}

type RequestOptions<T extends v.Type> = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string[];
  headers?: Record<string, string>;
  json?: unknown;
  responseType?: T;
};

const PATH_COMPONENT = /^[a-z0-9_-]+$/;

function joinPath(path: string[]): string {
  return path
    .map((component) => {
      if (!PATH_COMPONENT.test(component)) {
        throw new Error("invalid path component");
      }
      return encodeURIComponent(component);
    })
    .join("/");
}

async function dump(stream: ReadableStream | null) {
  if (stream) {
    for await (const _ of stream) {
      // pass
    }
  }
}

export interface ClientConfig {
  url: string;
  token: string;
  userAgent?: string;
}

export class Client {
  private readonly apiToken: string;
  private readonly baseUrl: URL;
  private readonly userAgent: string;

  constructor(config: ClientConfig) {
    this.apiToken = config.token;
    this.baseUrl = new URL(config.url);
    this.userAgent = config.userAgent ?? "libapp";
  }

  async requestWithEtag<T extends v.Type>(
    options: RequestOptions<T>,
  ): Promise<{ body: v.Infer<T>; etag?: string }> {
    const url = new URL(this.baseUrl);
    url.pathname = `${url.pathname}/app/${joinPath(options.path)}`.replace(
      /\/{2,}/g,
      "/",
    );

    const headers = new Headers(options.headers);
    headers.set("authorization", `Bearer ${this.apiToken}`);

    if (!headers.has("user-agent")) {
      headers.set("user-agent", this.userAgent);
    }

    let body: null | string = null;
    if (options.json !== undefined) {
      body = JSON.stringify(options.json);
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body,
    });
    const contentType = response.headers.get("content-type");
    const isJSON = /^application\/json\s*(;|$)/.test(contentType ?? "");

    if (response.status >= 400 && response.status < 600) {
      if (isJSON) {
        const rawBody: unknown = await response.json();

        const body = APIErrorBody.try(rawBody, { mode: "strip" });
        if (body.ok) {
          throw new APIError(
            response.status,
            response.statusText,
            body.value.error.code,
            body.value.error.reason,
          );
        }
      } else {
        await dump(response.body);
      }
      throw new HTTPError(response.status, response.statusText);
    }

    let json: unknown = undefined;
    if (isJSON) {
      json = await response.json();
    } else {
      await dump(response.body);
    }

    const etag = response.headers.get("etag") ?? undefined;
    if (!options.responseType) {
      return { body: json as v.Infer<T>, etag };
    }
    return { body: options.responseType.parse(json, { mode: "strip" }), etag };
  }

  async request<T extends v.Type>(
    options: RequestOptions<T>,
  ): Promise<v.Infer<T>> {
    const { body } = await this.requestWithEtag(options);
    return body;
  }
}
