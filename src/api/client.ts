import type { Infer, Type } from "@badrap/valita";
import { STATUS_CODES } from "node:http";
import { Headers, Pool } from "undici";

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
  idempotent?: boolean;
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

function getHeader(
  headers: Record<string, string | string[] | undefined>,
  name: "etag" | "content-type",
): string | undefined {
  const value = headers[name];
  if (Array.isArray(value)) {
    return value.join(",");
  }
  return value;
}

export interface ClientConfig {
  url: string;
  token: string;
  userAgent?: string;
}

export class Client {
  private readonly apiToken: string;
  private readonly baseUrl: URL;
  private readonly pool: Pool;
  private readonly userAgent: string;

  constructor(config: ClientConfig) {
    this.apiToken = config.token;
    this.baseUrl = new URL(config.url);
    this.pool = new Pool(this.baseUrl.origin);
    this.userAgent = config.userAgent ?? "libapp";
  }

  async requestWithEtag<T extends Type>(
    options: RequestOptions<T>,
  ): Promise<{ body: Infer<T>; etag?: string }> {
    let pathname = this.baseUrl.pathname + `/app/${joinPath(options.path)}`;
    pathname = pathname.replace(/\/+/g, "/");

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

    const response = await this.pool.request({
      path: pathname,
      method: options.method,
      headers: Object.fromEntries(headers.entries()),
      body,
      idempotent: options.idempotent,
    });
    if (response.statusCode >= 400 && response.statusCode < 600) {
      await response.body.dump();
      throw new HTTPError(
        response.statusCode,
        STATUS_CODES[response.statusCode] ?? "",
      );
    }

    const etag = getHeader(response.headers, "etag");
    const contentType = getHeader(response.headers, "content-type");

    let json: unknown = undefined;
    if (!/^application\/json\s*(;|$)/.test(contentType ?? "")) {
      await response.body.dump();
    } else {
      json = await response.body.json();
    }

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
