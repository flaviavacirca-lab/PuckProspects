interface CacheEntry<T> {
  data: T;
  expires: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expires: Date.now() + ttlMs });
  }

  clear(): void {
    this.store.clear();
  }
}

// Singleton - survives across requests on Vercel serverless (within same instance)
export const cache = new MemoryCache();
export const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
