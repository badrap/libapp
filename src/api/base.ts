import { fetch, RequestInit, Headers, Response } from "undici";

export class HTTPError extends Error {
  constructor(readonly statusCode: number, readonly statusText: string) {
    super(`HTTP status code ${statusCode} (${statusText})`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class APIBase {
  private readonly apiToken: string;
  private readonly baseUrl: URL;

  constructor(apiUrl: string, apiToken: string) {
    this.apiToken = apiToken;
    this.baseUrl = new URL(apiUrl);
  }

  async request(path: string, options: RequestInit): Promise<Response> {
    const url = new URL(this.baseUrl);
    if (path) {
      url.pathname += `/app/${path}`;
    }
    url.pathname = url.pathname.replace(/\/+/g, "/");

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${this.apiToken}`);

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText);
    }
    return response;
  }
}
