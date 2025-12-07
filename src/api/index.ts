import * as v from "@badrap/valita";
import { HTTPError, Client, type ClientConfig } from "./client.ts";
import { Kv } from "./kv.ts";

export { HTTPError };

export class UpdateFailed extends Error {
  constructor() {
    super("installation update failed");

    this.name = "UpdateFailed";
  }
}

export type Installation<State extends Record<string, unknown>> = {
  id: string;
  removed: boolean;
  state: State;
  owner?: { type: "team"; name: string } | { type: "user"; email: string };
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

interface Config<InstallationState> extends ClientConfig {
  stateType?: v.Type<InstallationState>;
}

export class API<
  InstallationState extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly #client: Client;
  readonly #stateType: v.Type<InstallationState>;
  readonly kv: Kv;

  constructor(config: Config<InstallationState>) {
    this.#client = new Client(config);
    this.#stateType =
      config.stateType ?? (v.record() as v.Type<InstallationState>);
    this.kv = new Kv(this.#client);
  }

  async checkAuthToken(
    token: string,
  ): Promise<{ installationId: string; sessionId: string; expiresAt: number }> {
    const result = await this.#client.request({
      method: "POST",
      path: ["token"],
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

  async *listInstallations(): AsyncIterable<{
    id: string;
    removed: boolean;
    owner?: { type: "team"; name: string } | { type: "user"; email: string };
  }> {
    yield* await this.#client.request({
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
    return this.#client.request({
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
    return this.#client.request({
      method: "GET",
      path: ["installations", installationId],
      responseType: v.object({
        id: v.string(),
        removed: v.boolean(),
        state: this.#stateType,
        owner: v
          .union(
            v.object({ type: v.literal("team"), name: v.string() }),
            v.object({ type: v.literal("user"), email: v.string() }),
          )
          .optional(),
      }),
    });
  }

  async updateInstallation(
    installationId: string,
    callback: (
      installation: Installation<InstallationState>,
    ) => MaybePromise<
      { assets?: Asset[]; state?: InstallationState } | undefined
    >,
    options?: {
      maxRetries?: number;
    },
  ): Promise<Installation<InstallationState>> {
    const { maxRetries = Infinity } = options ?? {};

    for (let i = 0; i <= maxRetries; i++) {
      const { body, etag } = await this.#client.requestWithEtag({
        method: "GET",
        path: ["installations", installationId],
        responseType: v.object({
          id: v.string(),
          removed: v.boolean(),
          state: this.#stateType,
          owner: v
            .union(
              v.object({ type: v.literal("team"), name: v.string() }),
              v.object({ type: v.literal("user"), email: v.string() }),
            )
            .optional(),
        }),
      });

      const patch = await callback(structuredClone(body));
      if (!patch) {
        return body;
      }
      const { assets, state } = patch;
      if (!assets && !state) {
        return body;
      }

      try {
        await this.#client.request({
          method: "PATCH",
          path: ["installations", installationId],
          headers: { "if-match": etag ?? "*" },
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
    await this.#client.request({
      method: "DELETE",
      path: ["installations", installationId],
    });
  }

  async *listOwnerAssets(
    installationId: string,
  ): AsyncIterable<{ type: "ip" | "email" | "domain"; value: string }> {
    yield* await this.#client.request({
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
      await this.#client.request({
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
      await this.#client.request({
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
    await this.#client.request({
      method: "POST",
      path: ["installations", installationId, "feeds", feedName, "events"],
      json: events,
    });
  }
}
