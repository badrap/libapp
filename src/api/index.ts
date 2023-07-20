import * as v from "@badrap/valita";
import { HTTPError, APIBase } from "./base.js";
import { Kv } from "./kv.js";

export { HTTPError };

function parse<T>(data: unknown, type: v.Type<T>): T {
  return type.parse(data, { mode: "strip" });
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
  private readonly base: APIBase;
  private readonly stateType: v.Type<InstallationState>;
  readonly experimentalKv: Kv;

  constructor(
    apiUrl: string,
    apiToken: string,
    stateType?: v.Type<InstallationState>
  ) {
    this.base = new APIBase(apiUrl, apiToken);
    this.stateType = stateType ?? (v.record() as v.Type<InstallationState>);
    this.experimentalKv = new Kv(this.base);
  }

  private installationPath(installationId: string, path?: string): string {
    if (!installationId.match(/^[a-z0-9_-]{1,}$/i)) {
      throw new Error("invalid installation ID");
    }
    let pathname = `installations/${installationId}`;
    if (path) {
      pathname += `/${path}`;
    }
    return pathname.replace(/\/+/g, "/");
  }

  async checkAuthToken(
    token: string
  ): Promise<{ installationId: string; sessionId: string; expiresAt: number }> {
    const result = await this.base
      .request("/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      })
      .then((r) => r.json());

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
    const result = await this.base
      .request("/seal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expires_in: expiresIn,
          data,
        }),
      })
      .then((r) => r.json());

    return parse(
      result,
      v.object({ data: v.string() }).map((r) => r.data)
    );
  }

  async unseal(data: string): Promise<unknown> {
    const result = await this.base
      .request("/unseal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
        }),
      })
      .then((r) => r.json());

    return parse(
      result,
      v.object({ data: v.unknown() }).map((r) => r.data)
    );
  }

  async getInstallations(): Promise<
    {
      id: string;
      removed: boolean;
      owner?: { type: "team"; name: string } | { type: "user"; email: string };
    }[]
  > {
    return this.base
      .request("/installations", { method: "GET" })
      .then((r) => r.json())
      .then((r) =>
        parse(
          r,
          v.array(
            v.object({
              id: v.string(),
              removed: v.boolean(),
              owner: v
                .union(
                  v.object({ type: v.literal("team"), name: v.string() }),
                  v.object({ type: v.literal("user"), email: v.string() })
                )
                .optional(),
            })
          )
        )
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
    return this.base
      .request(this.installationPath(installationId, "/callbacks"), {
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
    return this.base
      .request(this.installationPath(installationId), {
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

    const path = this.installationPath(installationId);

    for (let i = 0; i <= maxRetries; i++) {
      const response = await this.base.request(path, { method: "GET" });
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
        await this.base.request(path, {
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
    await this.base
      .request(this.installationPath(installationId), { method: "DELETE" })
      .then((r) => r.arrayBuffer());
  }

  async listOwnerAssets(
    installationId: string
  ): Promise<{ type: "ip" | "email" | "domain"; value: string }[]> {
    return this.base
      .request(this.installationPath(installationId, "/owner/assets"), {
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
      await this.base.request("/feeds", {
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
      await this.base.request(`/feeds/${encodeURIComponent(name)}`, {
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
      });
    }
  }

  async feedEventsForInstallation(
    installationId: string,
    feedName: string,
    events: Event[]
  ): Promise<void> {
    await this.base.request(
      this.installationPath(
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
