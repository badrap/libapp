import * as v from "@badrap/valita";
import type { APIBase } from "./base.js";

type KvKey = (number | string | boolean)[];

type KvEntry<T> = { key: KvKey; value: T; versionstamp: string };

type KvEntryMaybe<T> =
  | KvEntry<T>
  | { key: KvKey; value: null; versionstamp: null };

type AtomicCheck = { key: KvKey; versionstamp: string | null };

type KvMutation =
  | { type: "set"; key: KvKey; value: unknown }
  | { type: "delete"; key: KvKey };

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
      v.object({ key: Key, value: v.null(), versionstamp: v.null() })
    )
  ),
});

const ListResponse = v.object({
  entries: v.array(
    v.object({ key: Key, value: v.unknown(), versionstamp: v.string() })
  ),
  cursor: v.string().optional(),
});

const CommitResponse = v.union(
  v.object({ ok: v.literal(true), versionstamp: v.string() }),
  v.object({ ok: v.literal(false) })
);

export class Kv {
  constructor(private readonly base: APIBase) {}

  async get(key: KvKey): Promise<KvEntryMaybe<unknown>> {
    const [result] = await this.getMany([key]);
    if (!result) {
      throw new Error("expected an entry");
    }
    return result;
  }

  async getMany(keys: KvKey[]): Promise<KvEntryMaybe<unknown>[]> {
    const response = await this.base
      .request("/kv/get", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ keys }),
      })
      .then((r) => r.json())
      .then((json) => GetManyResponse.parse(json));
    if (response.entries.length !== keys.length) {
      throw new Error("an unexpected number of result entries");
    }
    return response.entries;
  }

  async *list(
    selector: KvListSelector,
    options?: KvListOptions
  ): KvListIterator<unknown> {
    let { limit } = options ?? {};
    let cursor: undefined | string = undefined;

    while (limit === undefined || limit > 0) {
      const response: v.Infer<typeof ListResponse> = await this.base
        .request("/kv/list", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            prefix: selector.prefix,
            limit: limit === undefined ? 100 : Math.min(100, limit),
            cursor,
          }),
        })
        .then((r) => r.json())
        .then((json) => ListResponse.parse(json));

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
    return new AtomicOperation(this.base);
  }
}

class AtomicOperation {
  private readonly _checks: AtomicCheck[] = [];
  private readonly _mutations: KvMutation[] = [];

  constructor(private readonly base: APIBase) {}

  check(...checks: AtomicCheck[]): this {
    this._checks.push(...checks);
    return this;
  }

  delete(key: KvKey): this {
    this._mutations.push({ type: "delete", key });
    return this;
  }

  set(key: KvKey, value: unknown): this {
    this._mutations.push({ type: "set", key, value });
    return this;
  }

  mutate(...mutations: KvMutation[]): this {
    this._mutations.push(...mutations);
    return this;
  }

  async commit(): Promise<KvCommitResult | KvCommitError> {
    return this.base
      .request("/kv/mutate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          checks: this._checks,
          mutations: this._mutations,
        }),
      })
      .then((r) => r.json())
      .then((json) => CommitResponse.parse(json));
  }
}