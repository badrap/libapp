import type { Infer, Type } from "@badrap/valita";

export class HTTPError extends Error {
  constructor(
    readonly statusCode: number,
    readonly statusText: string,
  ) {
    super(`HTTP status code ${statusCode} (${statusText})`);
  }
}

type RequestOptions<T extends Type> = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string[];
  headers?: Record<string, string>;
  json?: unknown;
  responseType?: T;
};

function joinPath(path: string[]): string {
  return path
    .map((component) => {
      if (!component.match(/^[a-z0-9_-]{1,}$/i)) {
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

  async requestWithEtag<T extends Type>(
    options: RequestOptions<T>,
  ): Promise<{ body: Infer<T>; etag?: string }> {
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
    if (response.status >= 400 && response.status < 600) {
      await dump(response.body);
      throw new HTTPError(response.status, response.statusText);
    }

    let json: unknown = undefined;
    const contentType = response.headers.get("content-type");
    if (!/^application\/json\s*(;|$)/.test(contentType ?? "")) {
      await dump(response.body);
    } else {
      json = await response.json();
    }

    const etag = response.headers.get("etag") ?? undefined;
    if (!options.responseType) {
      return { body: json as Infer<T>, etag };
    }
    return { body: options.responseType.parse(json, { mode: "strip" }), etag };
  }

  async request<T extends Type>(options: RequestOptions<T>): Promise<Infer<T>> {
    const { body } = await this.requestWithEtag(options);
    return body;
  }
}
