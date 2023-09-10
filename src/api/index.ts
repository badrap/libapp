import * as v from "@badrap/valita";
import { HTTPError, Client } from "./client.js";
import { Kv } from "./kv.js";

export { HTTPError };

export class UpdateFailed extends Error {
  constructor() {
    super("installation update failed");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

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

type MaybePromise<T> = Promise<T> | T;

export class API<
  InstallationState extends Record<string, unknown> = Record<string, unknown>,
> {
  private readonly client: Client;
  private readonly stateType: v.Type<InstallationState>;
  readonly experimentalKv: Kv;

  constructor(
    apiUrl: string,
    apiToken: string,
    stateType?: v.Type<InstallationState>,
  ) {
    this.client = new Client(apiUrl, apiToken);
    this.stateType = stateType ?? (v.record() as v.Type<InstallationState>);
    this.experimentalKv = new Kv(this.client);
  }

  async checkAuthToken(
    token: string,
  ): Promise<{ installationId: string; sessionId: string; expiresAt: number }> {
    const result = await this.client.request({
      method: "POST",
      path: ["token"],
      idempotent: true,
      json: { token },
      responseType: v.object({
        installation_id: v.string(),
        session_id: v.string(),
        expires_at: v.number(),
      }),
    });

    return {
      installationId: result.installation_id,
      sessionId: result.session_id,
      expiresAt: result.expires_at,
    };
  }

  async seal(data: unknown, expiresIn: number): Promise<string> {
    return this.client.request({
      method: "POST",
      path: ["seal"],
      idempotent: true,
      json: { expires_in: expiresIn, data },
      responseType: v.object({ data: v.string() }).map((r) => r.data),
    });
  }

  async unseal(data: string): Promise<unknown> {
    return this.client.request({
      method: "POST",
      path: ["unseal"],
      idempotent: true,
      json: { data },
      responseType: v.object({ data: v.unknown() }).map((r) => r.data),
    });
  }

  async getInstallations(): Promise<
    {
      id: string;
      removed: boolean;
      owner?: { type: "team"; name: string } | { type: "user"; email: string };
    }[]
  > {
    return this.client.request({
      method: "GET",
      path: ["installations"],
      responseType: v.array(
        v.object({
          id: v.string(),
          removed: v.boolean(),
          owner: v
            .union(
              v.object({ type: v.literal("team"), name: v.string() }),
              v.object({ type: v.literal("user"), email: v.string() }),
            )
            .optional(),
        }),
      ),
    });
  }

  async createInstallationCallback(
    installationId: string,
    sessionId: string,
    callback: {
      action?: unknown;
      clientState?: Record<string, unknown>;
    } = {},
  ): Promise<string> {
    return this.client.request({
      method: "POST",
      path: ["installations", installationId, "callbacks"],
      json: {
        session_id: sessionId,
        action: callback.action,
        client_state: callback.clientState,
      },
      responseType: v.object({ url: v.string() }).map((r) => r.url),
    });
  }

  async getInstallation(
    installationId: string,
  ): Promise<Installation<InstallationState>> {
    return this.client.request({
      method: "GET",
      path: ["installations", installationId],
      responseType: v.object({
        removed: v.boolean(),
        state: this.stateType,
      }),
    });
  }

  async updateInstallation(
    installationId: string,
    callback: (installation: Installation<InstallationState>) => MaybePromise<{
      assets?: Asset[];
      state?: InstallationState;
    } | void>,
    options?: {
      maxRetries?: number;
    },
  ): Promise<Installation<InstallationState>> {
    const { maxRetries = Infinity } = options ?? {};

    for (let i = 0; i <= maxRetries; i++) {
      const { body, etag } = await this.client.requestWithEtag({
        method: "GET",
        path: ["installations", installationId],
        responseType: v.object({
          removed: v.boolean(),
          state: this.stateType,
        }),
      });

      const patch = await callback(JSON.parse(JSON.stringify(body)));
      if (!patch) {
        return body;
      }
      const { assets, state } = patch;
      if (!assets && !state) {
        return body;
      }

      try {
        await this.client.request({
          method: "PATCH",
          path: ["installations", installationId],
          headers: { "if-match": etag || "*" },
          json: patch,
        });
      } catch (err) {
        if (err instanceof HTTPError && err.statusCode === 412) {
          continue;
        }
        throw err;
      }
      return { ...body, ...patch };
    }

    throw new UpdateFailed();
  }

  async removeInstallation(installationId: string): Promise<void> {
    await this.client.request({
      method: "DELETE",
      path: ["installations", installationId],
    });
  }

  async listOwnerAssets(
    installationId: string,
  ): Promise<{ type: "ip" | "email" | "domain"; value: string }[]> {
    return this.client.request({
      method: "GET",
      path: ["installations", installationId, "owner", "assets"],
      responseType: v.array(
        v.object({
          type: v.union(
            v.literal("ip"),
            v.literal("email"),
            v.literal("domain"),
          ),
          value: v.string(),
        }),
      ),
    });
  }

  async ensureFeed(
    name: string,
    config?: {
      title?: string;
      summaryTemplate?: unknown;
      detailsTemplate?: unknown;
    },
  ): Promise<void> {
    try {
      await this.client.request({
        method: "POST",
        path: ["feeds"],
        json: {
          name,
          title: config?.title,
          summary_template: config?.summaryTemplate,
          details_template: config?.detailsTemplate,
        },
      });
    } catch (err: unknown) {
      if (!(err instanceof HTTPError) || err.statusCode !== 409) {
        throw err;
      }
      await this.client.request({
        method: "PATCH",
        path: ["feeds", name],
        headers: { "if-match": "*" },
        json: {
          title: config?.title,
          summary_template: config?.summaryTemplate,
          details_template: config?.detailsTemplate,
        },
      });
    }
  }

  async feedEventsForInstallation(
    installationId: string,
    feedName: string,
    events: Event[],
  ): Promise<void> {
    await this.client.request({
      method: "POST",
      path: ["installations", installationId, "feeds", feedName, "events"],
      json: events,
    });
  }
}
