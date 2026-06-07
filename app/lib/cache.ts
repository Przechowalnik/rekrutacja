import { z } from "zod";

type Envelope<T> = {
  data: T;
  expiresAt: number;
};

export function expiryCache<T>(options: {
  key: string;
  schema: z.ZodType<T>;
  storage: Storage;
}) {
  const Z_Envelope = z
    .object({
      data: options.schema,
      expiresAt: z.number(),
    })
    .strict();

  function get(): null | T {
    const raw = options.storage.getItem(options.key);
    if (!raw) {
      return null;
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      options.storage.removeItem(options.key);
      return null;
    }

    const parsed = Z_Envelope.safeParse(json);
    if (!parsed.success) {
      options.storage.removeItem(options.key);
      return null;
    }

    const { data, expiresAt } = parsed.data;

    if (Date.now() >= expiresAt) {
      options.storage.removeItem(options.key);
      return null;
    }

    return data ?? null;
  }

  function set(parameters: { data: T; expiresInMs: number }): void;
  function set(parameters: { data: T; expiresAt: Date }): void;
  function set(parameters: { data: T; expiresAt: number }): void;
  function set(parameters: {
    data: T;
    expiresAt?: Date | number;
    expiresInMs?: number;
  }) {
    const { data, expiresAt, expiresInMs } = parameters;

    let resolvedExpiresAt: number;

    if (typeof expiresInMs === "number") {
      resolvedExpiresAt = Date.now() + expiresInMs;
    } else if (expiresAt instanceof Date) {
      resolvedExpiresAt = expiresAt.getTime();
    } else if (typeof expiresAt === "number") {
      resolvedExpiresAt = expiresAt;
    } else {
      throw new TypeError("Either expiresInMs or expiresAt must be provided");
    }

    options.storage.setItem(
      options.key,
      JSON.stringify({
        data,
        expiresAt: resolvedExpiresAt,
      } satisfies Envelope<T>),
    );
  }

  function clear() {
    options.storage.removeItem(options.key);
  }

  return { clear, get, set };
}
