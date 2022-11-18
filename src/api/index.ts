import path from "node:path";
import * as v from "@badrap/valita";
import { fetch, RequestInit, Headers, Response } from "undici";

function parse<T>(data: unknown, type: v.Type<T>): T {
  return type.parse(data, { mode: "strip" });
}

export class HTTPError extends Error {
  constructor(readonly statusCode: number, readonly statusText: string) {
    super(`HTTP status code ${statusCode} (${statusText})`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UpdateFailed extends Error {
  constructor() {
    super("installation update failed");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

type MaybePromise<T> = Promise<T> | T;

export type Installation<State extends Record<string, unknown>> = {
  removed: boolean;
  state: State;
};

export type Asset = Readonly<{
  type: "ip" | "email" | "domain" | "opaque";
  value: string;
  key?: string;
  props?: Record<string, unknown>;
}>;

export type Event = Readonly<{
  type: "ip" | "email" | "domain" | "opaque";
  value: string;
  key?: string;
  props?: Record<string, unknown>;
}>;

export class API<
  InstallationState extends Record<string, unknown> = Record<string, unknown>
> {
  private readonly apiToken: string;
  private readonly baseUrl: URL;
  private readonly stateType: v.Type<InstallationState>;

  constructor(
    apiUrl: string,
    apiToken: string,
    stateType?: v.Type<InstallationState>
  ) {
    this.stateType = stateType ?? (v.record() as v.Type<InstallationState>);
    this.apiToken = apiToken;
    this.baseUrl = new URL(apiUrl);
    this.baseUrl.pathname = path.posix.join(this.baseUrl.pathname, "app/");
  }

  private installationUrl(installationId: string, path?: string): URL {
    if (!installationId.match(/^[a-z0-9_-]{1,}$/i)) {
      throw new Error("invalid installation ID");
    }
    const url = new URL(`installations/${installationId}`, this.baseUrl);
    if (path) {
      url.pathname += `/${path}`;
    }
    url.pathname = url.pathname.replace(/\/+/g, "/");
    return url;
  }

  private async request(url: URL, options: RequestInit): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${this.apiToken}`);

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText);
    }
    return response;
  }

  async checkAuthToken(
    token: string
  ): Promise<{ installationId: string; sessionId: string; expiresAt: number }> {
    const result = await this.request(new URL("token", this.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
      }),
    }).then((r) => r.json());

    const {
      installation_id: installationId,
      session_id: sessionId,
      expires_at: expiresAt,
    } = parse(
      result,
      v.object({
        installation_id: v.string(),
        session_id: v.string(),
        expires_at: v.number(),
      })
    );

    return { installationId, sessionId, expiresAt };
  }

  async seal(data: unknown, expiresIn: number): Promise<string> {
    const result = await this.request(new URL("seal", this.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expires_in: expiresIn,
        data,
      }),
    }).then((r) => r.json());

    return parse(
      result,
      v.object({ data: v.string() }).map((r) => r.data)
    );
  }

  async unseal(data: string): Promise<unknown> {
    const result = await this.request(new URL("unseal", this.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
      }),
    }).then((r) => r.json());

    return parse(
      result,
      v.object({ data: v.unknown() }).map((r) => r.data)
    );
  }

  async getInstallations(): Promise<{ id: string; removed: boolean }[]> {
    return this.request(new URL("installations", this.baseUrl), {
      method: "GET",
    })
      .then((r) => r.json())
      .then((r) =>
        parse(r, v.array(v.object({ id: v.string(), removed: v.boolean() })))
      );
  }

  async createInstallationCallback(
    installationId: string,
    sessionId: string,
    callback: {
      action?: unknown;
      clientState?: Record<string, unknown>;
    } = {}
  ): Promise<string> {
    return this.request(this.installationUrl(installationId, "/callbacks"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        action: callback.action,
        client_state: callback.clientState,
      }),
    })
      .then((r) => r.json())
      .then((r) =>
        parse(
          r,
          v.object({ url: v.string() }).map((r) => r.url)
        )
      );
  }

  async getInstallation(
    installationId: string
  ): Promise<Installation<InstallationState>> {
    return this.request(this.installationUrl(installationId), {
      method: "GET",
    })
      .then((r) => r.json())
      .then((r) =>
        parse(
          r,
          v.object({
            removed: v.boolean(),
            state: this.stateType,
          })
        )
      );
  }

  async updateInstallation(
    installationId: string,
    callback: (installation: Installation<InstallationState>) => MaybePromise<{
      assets?: Asset[];
      state?: InstallationState;
    } | void>,
    options?: {
      maxRetries?: number;
    }
  ): Promise<Installation<InstallationState>> {
    const { maxRetries = Infinity } = options ?? {};

    const url = this.installationUrl(installationId);

    for (let i = 0; i <= maxRetries; i++) {
      const response = await this.request(url, { method: "GET" });
      const etag = response.headers.get("etag");
      const input = await response.json().then((r) =>
        parse(
          r,
          v.object({
            removed: v.boolean(),
            state: this.stateType,
          })
        )
      );

      const patch = await callback(JSON.parse(JSON.stringify(input)));
      if (!patch) {
        return input;
      }
      const { assets, state } = patch;
      if (!assets && !state) {
        return input;
      }

      try {
        await this.request(url, {
          method: "PATCH",
          headers: {
            "If-Match": etag || "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patch),
        });
      } catch (err) {
        if (err instanceof HTTPError && err.statusCode === 412) {
          continue;
        }
        throw err;
      }
      return { ...input, ...patch };
    }

    throw new UpdateFailed();
  }

  async removeInstallation(installationId: string): Promise<void> {
    await this.request(this.installationUrl(installationId), {
      method: "DELETE",
    }).then((r) => r.arrayBuffer());
  }

  async listOwnerAssets(
    installationId: string
  ): Promise<{ type: "ip" | "email" | "domain"; value: string }[]> {
    return this.request(this.installationUrl(installationId, "/owner/assets"), {
      method: "GET",
    })
      .then((r) => r.json())
      .then((r) =>
        parse(
          r,
          v.array(
            v.object({
              type: v.union(
                v.literal("ip"),
                v.literal("email"),
                v.literal("domain")
              ),
              value: v.string(),
            })
          )
        )
      );
  }

  async ensureFeed(
    name: string,
    config?: {
      title?: string;
      summaryTemplate?: unknown;
      detailsTemplate?: unknown;
    }
  ): Promise<void> {
    try {
      await this.request(new URL("feeds", this.baseUrl), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          title: config?.title,
          summary_template: config?.summaryTemplate,
          details_template: config?.detailsTemplate,
        }),
      });
    } catch (err: unknown) {
      if (!(err instanceof HTTPError) || err.statusCode !== 409) {
        throw err;
      }
      await this.request(
        new URL(`feeds/${encodeURIComponent(name)}`, this.baseUrl),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "If-Match": "*",
          },
          body: JSON.stringify({
            title: config?.title,
            summary_template: config?.summaryTemplate,
            details_template: config?.detailsTemplate,
          }),
        }
      );
    }
  }

  async feedEventsForInstallation(
    installationId: string,
    feedName: string,
    events: Event[]
  ): Promise<void> {
    await this.request(
      this.installationUrl(
        installationId,
        `/feeds/${encodeURIComponent(feedName)}/events`
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(events),
      }
    );
  }
}
