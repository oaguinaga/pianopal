/**
 * SSR-safe dynamic import helper.
 * Returns a memoized ESM module (normalizing default/namespace exports) only on the client.
 */
export function useClientModule<T = unknown>() {
  let cached: any | null = null;
  const isClient = typeof window !== "undefined" && typeof document !== "undefined";

  async function load(factory: () => Promise<any>): Promise<T | null> {
    if (!isClient)
      return null;
    if (cached)
      return cached as T;
    const mod = await factory();
    cached = (mod as any).default ?? mod;
    return cached as T;
  }

  return { load, isClient } as const;
}
