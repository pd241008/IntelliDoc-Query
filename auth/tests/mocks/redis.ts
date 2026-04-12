/**
 * Fake Redis Client Stub
 *
 * Lightweight in-memory implementation using Map().
 * Supports get, set, setEx, del, flushAll, and exposes the
 * internal store for test assertions.
 */

const store = new Map<string, string>();

export const mockRedisClient = {
  /** Retrieve a value by key. Returns null if not found (mirrors ioredis). */
  get: jest.fn(async (key: string): Promise<string | null> => {
    return store.get(key) || null;
  }),

  /** Set a key-value pair. Options (EX, PX, etc.) are accepted but ignored. */
  set: jest.fn(async (key: string, value: string, _options?: any): Promise<"OK"> => {
    store.set(key, value);
    return "OK";
  }),

  /** Set a key with an expiry (TTL is recorded but not enforced). */
  setEx: jest.fn(async (key: string, _seconds: number, value: string): Promise<"OK"> => {
    store.set(key, value);
    return "OK";
  }),

  /** Delete a key. Returns 1 if found, 0 otherwise (mirrors Redis DEL). */
  del: jest.fn(async (key: string): Promise<number> => {
    return store.delete(key) ? 1 : 0;
  }),

  /** Check if a key exists. */
  exists: jest.fn(async (key: string): Promise<number> => {
    return store.has(key) ? 1 : 0;
  }),

  /** Wipe all keys — useful in afterEach hooks. */
  flushAll: jest.fn(async (): Promise<"OK"> => {
    store.clear();
    return "OK";
  }),

  /** Direct access to the backing store for assertions. */
  _store: store,
};

/**
 * Reset the mock between tests.
 * Clears stored data AND resets jest call history.
 */
export function resetMockRedis(): void {
  store.clear();
  Object.values(mockRedisClient).forEach((fn) => {
    if (typeof fn === "function" && "mockClear" in fn) {
      (fn as jest.Mock).mockClear();
    }
  });
}
