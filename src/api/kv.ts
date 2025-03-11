import * as v from "@badrap/valita";
import { Client, HTTPError } from "./client.js";

type KvKey = (number | string | boolean)[];

type KvEntry<T> = { key: KvKey; value: T; versionstamp: string };

type KvEntryMaybe<T> =
  | KvEntry<T>
  | { key: KvKey; value: null; versionstamp: null };

type AtomicCheck = { key: KvKey; versionstamp: string | null };

type KvMutation =
  | {
      type: "set";
      key: KvKey;
      value: unknown;
      expireIn?: number;
    }
  | {
      type: "delete";
      key: KvKey;
    }
  | {
      type: "enqueue";
      value: unknown;
      pathname?: string;
      delay?: number;
      keysIfUndelivered?: KvKey[];
      backoffSchedule?: number[];
    };

type KvCommitResult = { ok: true; versionstamp: string };

type KvCommitError = { ok: false };

type KvListSelector = { prefix: KvKey };

type KvListOptions = { limit?: number };

type KvListIterator<T> = AsyncIterableIterator<KvEntry<T>>;

const Key = v.array(v.union(v.string(), v.number(), v.boolean()));

const GetManyResponse = v.object({
  entries: v.array(
    v.union(
      v.object({ key: Key, value: v.unknown(), versionstamp: v.string() }),
      v.object({ key: Key, value: v.null(), versionstamp: v.null() }),
    ),
  ),
});

const ListResponse = v.object({
  entries: v.array(
    v.object({ key: Key, value: v.unknown(), versionstamp: v.string() }),
  ),
  cursor: v.string().optional(),
});

const CommitResponse = v.union(v.object({ versionstamp: v.string() }));

export class Kv {
  constructor(private readonly client: Client) {}

  async set(
    key: KvKey,
    value: unknown,
    options?: { expireIn?: number },
  ): Promise<KvCommitResult> {
    const result = await this.atomic().set(key, value, options).commit();
    if (!result.ok) {
      throw new Error("expected a successful commit");
    }
    return result;
  }

  async delete(key: KvKey): Promise<void> {
    const result = await this.atomic().delete(key).commit();
    if (!result.ok) {
      throw new Error("expected a successful commit");
    }
  }

  async get(key: KvKey): Promise<KvEntryMaybe<unknown>> {
    const [result] = await this.getMany([key]);
    if (!result) {
      throw new Error("expected an entry");
    }
    return result;
  }

  async getMany(keys: KvKey[]): Promise<KvEntryMaybe<unknown>[]> {
    const response = await this.client.request({
      method: "POST",
      path: ["kv", "get"],
      json: { keys },
      responseType: GetManyResponse,
    });
    if (response.entries.length !== keys.length) {
      throw new Error("an unexpected number of result entries");
    }
    return response.entries;
  }

  async *list(
    selector: KvListSelector,
    options?: KvListOptions,
  ): KvListIterator<unknown> {
    let { limit } = options ?? {};
    let cursor: undefined | string = undefined;

    while (limit === undefined || limit > 0) {
      const response: v.Infer<typeof ListResponse> = await this.client.request({
        path: ["kv", "list"],
        method: "POST",
        json: {
          prefix: selector.prefix,
          limit: limit === undefined ? 100 : Math.min(100, limit),
          cursor,
        },
        responseType: ListResponse,
      });

      yield* response.entries.slice(0, limit);
      if (limit !== undefined) {
        limit -= response.entries.length;
      }

      cursor = response.cursor;
      if (cursor === undefined) {
        break;
      }
    }
  }

  atomic(): AtomicOperation {
    return new AtomicOperation(this.client);
  }
}

class AtomicOperation {
  private readonly _checks: AtomicCheck[] = [];
  private readonly _mutations: KvMutation[] = [];

  constructor(private readonly base: Client) {}

  check(...checks: AtomicCheck[]): this {
    for (const { key, versionstamp } of checks) {
      this._checks.push({ key, versionstamp });
    }
    return this;
  }

  delete(key: KvKey): this {
    this._mutations.push({ type: "delete", key });
    return this;
  }

  set(key: KvKey, value: unknown, options?: { expireIn?: number }): this {
    this._mutations.push({
      type: "set",
      key,
      value,
      expireIn: options?.expireIn,
    });
    return this;
  }

  /** @experimental */
  enqueue(
    value: unknown,
    options?: {
      pathname?: string;
      delay?: number;
      keysIfUndelivered?: KvKey[];
      backoffSchedule?: number[];
    },
  ): this {
    this._mutations.push({
      type: "enqueue",
      value,
      pathname: options?.pathname,
      delay: options?.delay,
      keysIfUndelivered: options?.keysIfUndelivered,
      backoffSchedule: options?.backoffSchedule,
    });
    return this;
  }

  mutate(...mutations: KvMutation[]): this {
    for (const mutation of mutations) {
      switch (mutation.type) {
        case "set": {
          this.set(mutation.key, mutation.value, mutation);
          break;
        }
        case "delete": {
          this.delete(mutation.key);
          break;
        }
        case "enqueue": {
          this.enqueue(mutation.value, mutation);
          break;
        }
      }
    }
    return this;
  }

  async commit(): Promise<KvCommitResult | KvCommitError> {
    return this.base
      .request({
        method: "POST",
        path: ["kv", "mutate"],
        json: {
          checks: this._checks,
          mutations: this._mutations,
        },
        responseType: CommitResponse,
      })
      .then(
        ({ versionstamp }) => {
          return { ok: true, versionstamp };
        },
        (err: unknown) => {
          if (err instanceof HTTPError && err.statusCode === 409) {
            return { ok: false };
          }
          throw err;
        },
      );
  }
}
